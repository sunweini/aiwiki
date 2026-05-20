package service

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"
	"yfsc-platform-v2/backend/pkg/douyin"

	"gorm.io/gorm"
)

type DouyinService struct {
	db      *gorm.DB
	repo    *repository.PaymentRepo
	factory *PlatformClientFactory
}

func NewDouyinService(db *gorm.DB, paymentRepo *repository.PaymentRepo, factory *PlatformClientFactory) *DouyinService {
	return &DouyinService{db: db, repo: paymentRepo, factory: factory}
}

// GetDashboard 获取抖音核销仪表盘数据：总核销数、总金额、待结算金额
func (s *DouyinService) GetDashboard(shopID *int64) (map[string]interface{}, error) {
	log.Printf("[DouyinService] GetDashboard called, shopID: %v", shopID)
	query := s.db.Model(&model.DouyinVerifyRecord{})
	if shopID != nil {
		query = query.Where("shop_id = ?", *shopID)
	}

	var totalVerify int64
	var totalAmount float64
	var pendingAmount float64
	query.Count(&totalVerify)
	if err := query.Select("COALESCE(sum(amount), 0)").Scan(&totalAmount).Error; err != nil {
		log.Printf("[DouyinService] GetDashboard failed: %v", err)
		return nil, err
	}
	if err := s.db.Model(&model.DouyinSettlement{}).Where("status = ?", "待结算").
		Select("COALESCE(sum(settlement_amount), 0)").Scan(&pendingAmount).Error; err != nil {
		log.Printf("[DouyinService] GetDashboard failed: %v", err)
		return nil, err
	}

	result := map[string]interface{}{
		"total_verify":   totalVerify,
		"total_amount":   totalAmount,
		"pending_amount": pendingAmount,
	}
	log.Printf("[DouyinService] GetDashboard succeeded: totalVerify=%d, totalAmount=%.2f", totalVerify, totalAmount)
	return result, nil
}

// ListRecords 分页查询抖音验券记录，支持条件过滤
func (s *DouyinService) ListRecords(page, pageSize int, filters map[string]interface{}) ([]model.DouyinVerifyRecord, int64, error) {
	log.Printf("[DouyinService] ListRecords called, page: %d, pageSize: %d", page, pageSize)
	var records []model.DouyinVerifyRecord
	var total int64

	query := s.db.Model(&model.DouyinVerifyRecord{}).Preload("Shop")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}
	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&records).Error; err != nil {
		log.Printf("[DouyinService] ListRecords failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[DouyinService] ListRecords succeeded: total %d", total)
	return records, total, nil
}

// ListSettlements 分页查询抖音结算记录，支持条件过滤
func (s *DouyinService) ListSettlements(page, pageSize int, filters map[string]interface{}) ([]model.DouyinSettlement, int64, error) {
	log.Printf("[DouyinService] ListSettlements called, page: %d, pageSize: %d", page, pageSize)
	var settlements []model.DouyinSettlement
	var total int64

	query := s.db.Model(&model.DouyinSettlement{}).Preload("Shop")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}
	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&settlements).Error; err != nil {
		log.Printf("[DouyinService] ListSettlements failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[DouyinService] ListSettlements succeeded: total %d", total)
	return settlements, total, nil
}

// ListStoreMappings 查询所有抖音店铺映射关系
func (s *DouyinService) ListStoreMappings() ([]model.DouyinStoreMapping, error) {
	log.Printf("[DouyinService] ListStoreMappings called")
	var mappings []model.DouyinStoreMapping
	err := s.db.Preload("Shop").Find(&mappings).Error
	if err != nil {
		log.Printf("[DouyinService] ListStoreMappings failed: %v", err)
	}
	return mappings, err
}

// UpsertStoreMapping 新增或更新抖音店铺映射关系
func (s *DouyinService) UpsertStoreMapping(mapping *model.DouyinStoreMapping) error {
	log.Printf("[DouyinService] UpsertStoreMapping called, shopID: %d, poiID: %s", mapping.ShopID, mapping.POIID)
	var existing model.DouyinStoreMapping
	err := s.db.Where("shop_id = ? AND poi_id = ?", mapping.ShopID, mapping.POIID).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		if err := s.db.Create(mapping).Error; err != nil {
			log.Printf("[DouyinService] UpsertStoreMapping failed: create error %v", err)
			return err
		}
		log.Printf("[DouyinService] UpsertStoreMapping succeeded: new mapping created")
		return nil
	}
	if err != nil {
		log.Printf("[DouyinService] UpsertStoreMapping failed: lookup error %v", err)
		return err
	}
	if err := s.db.Model(&model.DouyinStoreMapping{}).Where("id = ?", existing.ID).Updates(map[string]interface{}{
		"auth_status": mapping.AuthStatus, "sync_status": mapping.SyncStatus,
	}).Error; err != nil {
		log.Printf("[DouyinService] UpsertStoreMapping failed: update error %v", err)
		return err
	}
	log.Printf("[DouyinService] UpsertStoreMapping succeeded: existing mapping updated")
	return nil
}

// GetVerifyTrend 获取抖音核销趋势（按日期聚合数量和金额）
func (s *DouyinService) GetVerifyTrend(shopID *int64, startDate, endDate string) ([]VerifyTrendPoint, error) {
	log.Printf("[DouyinService] GetVerifyTrend called, startDate: %s, endDate: %s", startDate, endDate)
	query := s.db.Model(&model.DouyinVerifyRecord{}).
		Where("verified_at >= ? AND verified_at <= ?", startDate, endDate+" 23:59:59")
	if shopID != nil {
		query = query.Where("shop_id = ?", *shopID)
	}

	var rows []struct {
		Date   string
		Count  int64
		Amount float64
	}
	if err := query.Select("DATE(verified_at) as date, COUNT(*) as count, COALESCE(SUM(amount), 0) as amount").
		Group("DATE(verified_at)").Order("date ASC").Scan(&rows).Error; err != nil {
		log.Printf("[DouyinService] GetVerifyTrend failed: %v", err)
		return nil, err
	}

	var trend []VerifyTrendPoint
	for _, r := range rows {
		trend = append(trend, VerifyTrendPoint{Date: r.Date, Count: r.Count, Amount: math.Round(r.Amount*100) / 100})
	}
	log.Printf("[DouyinService] GetVerifyTrend succeeded: %d data points", len(trend))
	return trend, nil
}

// GetVerifyByShop 按店铺维度统计抖音核销数据
func (s *DouyinService) GetVerifyByShop(shopID *int64, startDate, endDate string) ([]map[string]interface{}, error) {
	log.Printf("[DouyinService] GetVerifyByShop called, startDate: %s, endDate: %s", startDate, endDate)
	query := s.db.Model(&model.DouyinVerifyRecord{}).
		Joins("LEFT JOIN shop ON shop.id = douyin_verify_record.shop_id").
		Where("douyin_verify_record.verified_at >= ? AND douyin_verify_record.verified_at <= ?", startDate, endDate+" 23:59:59")
	if shopID != nil {
		query = query.Where("douyin_verify_record.shop_id = ?", *shopID)
	}

	var rows []struct {
		ShopName string
		Count    int64
		Amount   float64
	}
	if err := query.Select("shop.name as shop_name, COUNT(*) as count, COALESCE(SUM(douyin_verify_record.amount), 0) as amount").
		Group("shop.name").Order("amount DESC").Scan(&rows).Error; err != nil {
		log.Printf("[DouyinService] GetVerifyByShop failed: %v", err)
		return nil, err
	}

	var result []map[string]interface{}
	for _, r := range rows {
		result = append(result, map[string]interface{}{
			"shop_name": r.ShopName, "count": r.Count, "amount": math.Round(r.Amount*100) / 100,
		})
	}
	log.Printf("[DouyinService] GetVerifyByShop succeeded: %d shops", len(result))
	return result, nil
}

// TriggerSettlement 触发抖音结算：汇总指定店铺日期的核销记录，生成结算单
func (s *DouyinService) TriggerSettlement(shopID int64, date string) (*model.DouyinSettlement, error) {
	log.Printf("[DouyinService] TriggerSettlement called, shopID: %d, date: %s", shopID, date)
	var records []model.DouyinVerifyRecord
	if err := s.db.Where("shop_id = ? AND DATE(verified_at) = ?", shopID, date).
		Find(&records).Error; err != nil {
		log.Printf("[DouyinService] TriggerSettlement failed: query records error %v", err)
		return nil, err
	}
	if len(records) == 0 {
		log.Printf("[DouyinService] TriggerSettlement failed: no verify records for shop %d on %s", shopID, date)
		return nil, fmt.Errorf("no verify records found for shop %d on %s", shopID, date)
	}

	var verifyCount int
	var verifyTotal, commissionTotal float64
	for _, r := range records {
		verifyCount++
		verifyTotal += r.Amount
		commissionTotal += r.Commission
	}
	settlementAmount := verifyTotal - commissionTotal

	batchNo := fmt.Sprintf("DY-%s-%04d", date[:10], shopID)
	settlement := &model.DouyinSettlement{
		BatchNo:          batchNo,
		ShopID:           shopID,
		VerifyCount:      verifyCount,
		VerifyTotal:      math.Round(verifyTotal*100) / 100,
		CommissionTotal:  math.Round(commissionTotal*100) / 100,
		SettlementAmount: math.Round(settlementAmount*100) / 100,
		Status:           "待结算",
	}
	settlement.SettlementDate = new(time.Time)
	*settlement.SettlementDate = time.Now()

	if err := s.db.Create(settlement).Error; err != nil {
		log.Printf("[DouyinService] TriggerSettlement failed: create settlement error %v", err)
		return nil, err
	}
	log.Printf("[DouyinService] TriggerSettlement succeeded: batchNo=%s, count=%d, amount=%.2f", batchNo, verifyCount, settlementAmount)
	return settlement, nil
}

// GetConfig 获取抖音API配置
func (s *DouyinService) GetConfig() (*model.DouyinApiConfig, error) {
	log.Printf("[DouyinService] GetConfig called")
	var cfg model.DouyinApiConfig
	err := s.db.First(&cfg).Error
	if err != nil {
		log.Printf("[DouyinService] GetConfig failed: %v", err)
		return nil, err
	}
	return &cfg, nil
}

// UpdateConfig 更新抖音API配置
func (s *DouyinService) UpdateConfig(updates map[string]interface{}) error {
	log.Printf("[DouyinService] UpdateConfig called")
	if err := s.db.Model(&model.DouyinApiConfig{}).Where("id > 0").Updates(updates).Error; err != nil {
		log.Printf("[DouyinService] UpdateConfig failed: %v", err)
		return err
	}
	log.Printf("[DouyinService] UpdateConfig succeeded")
	return nil
}

// QueryCouponFromPlatform 从抖音平台实时查询券码状态
func (s *DouyinService) QueryCouponFromPlatform(ctx context.Context, shopID int64, couponCode string) (*douyin.CertificateInfo, error) {
	log.Printf("[DouyinService] QueryCouponFromPlatform called, shopID: %d, code: %s", shopID, couponCode)
	token, err := s.factory.GetStoreToken(ctx, "douyin", shopID)
	if err != nil {
		return nil, fmt.Errorf("门店未授权，请先完成门店绑定: %w", err)
	}
	client, err := s.factory.CreateDouyinClient()
	if err != nil {
		return nil, err
	}
	info, err := client.PrepareCertificate(ctx, token, &douyin.PrepareRequest{CertificateCode: couponCode})
	if err != nil {
		log.Printf("[DouyinService] QueryCouponFromPlatform failed: %v", err)
		return nil, err
	}
	log.Printf("[DouyinService] QueryCouponFromPlatform succeeded: product=%s, amount=%d", info.ProductName, info.Amount)
	return info, nil
}

// VerifyCouponOnPlatform 实际核销：宣券+验券+持久化
func (s *DouyinService) VerifyCouponOnPlatform(ctx context.Context, shopID int64, poiID, couponCode string, operatorID int64) (*model.DouyinVerifyRecord, error) {
	log.Printf("[DouyinService] VerifyCouponOnPlatform called, shopID: %d, poiID: %s, code: %s", shopID, poiID, couponCode)
	token, err := s.factory.GetStoreToken(ctx, "douyin", shopID)
	if err != nil {
		return nil, fmt.Errorf("门店未授权: %w", err)
	}
	client, err := s.factory.CreateDouyinClient()
	if err != nil {
		return nil, err
	}

	// Step 1: 宣券
	certInfo, err := client.PrepareCertificate(ctx, token, &douyin.PrepareRequest{CertificateCode: couponCode})
	if err != nil {
		return nil, fmt.Errorf("宣券失败: %w", err)
	}

	// Step 2: 验券
	result, err := client.VerifyCertificate(ctx, token, &douyin.VerifyRequest{
		CertificateCode: couponCode,
		VerifyType:      1,
		VerifyTime:      time.Now().Unix(),
		VerifyID:        fmt.Sprintf("dy-verify-%d", time.Now().Unix()),
		POIID:           poiID,
	})
	if err != nil {
		return nil, fmt.Errorf("验券失败: %w", err)
	}
	if !result.Success {
		return nil, fmt.Errorf("验券未成功: %s", result.Message)
	}

	// Step 3: 持久化（抖音金额为分，需转元）
	record := &model.DouyinVerifyRecord{
		VerifyNo:         fmt.Sprintf("DY%s%s", couponCode, time.Now().Format("20060102150405")),
		ShopID:           shopID,
		CouponName:       certInfo.ProductName,
		Amount:           float64(certInfo.Amount) / 100,
		VerifiedAt:       PtrTime(time.Now()),
		OperatorID:       operatorID,
	}
	if err := s.db.Create(record).Error; err != nil {
		log.Printf("[DouyinService] VerifyCouponOnPlatform persist failed: %v", err)
		return nil, err
	}
	log.Printf("[DouyinService] VerifyCouponOnPlatform succeeded: record %d", record.ID)
	return record, nil
}

// RevokeVerify 撤销抖音验券
func (s *DouyinService) RevokeVerify(ctx context.Context, verifyNo string, reason string) error {
	log.Printf("[DouyinService] RevokeVerify called, verifyNo: %s, reason: %s", verifyNo, reason)
	var record model.DouyinVerifyRecord
	if err := s.db.Where("verify_no = ?", verifyNo).First(&record).Error; err != nil {
		return fmt.Errorf("核销记录不存在: %w", err)
	}

	token, err := s.factory.GetStoreToken(ctx, "douyin", record.ShopID)
	if err != nil {
		return err
	}
	client, err := s.factory.CreateDouyinClient()
	if err != nil {
		return err
	}

	if err := client.ReverseVerify(ctx, token, record.VerifyNo); err != nil {
		return fmt.Errorf("平台撤销失败: %w", err)
	}

	if err := s.db.Model(&record).Updates(map[string]interface{}{
		"settlement_amount": 0,
	}).Error; err != nil {
		return err
	}
	log.Printf("[DouyinService] RevokeVerify succeeded: verifyNo %s", verifyNo)
	return nil
}

// EnrichDashboard 用平台实时数据增强看板
func (s *DouyinService) EnrichDashboard(ctx context.Context, shopID int64, data map[string]interface{}) map[string]interface{} {
	if s.factory == nil {
		data["source"] = "local"
		return data
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	token, tokenErr := s.factory.GetStoreToken(ctx, "douyin", shopID)
	if tokenErr != nil {
		data["source"] = "local"
		return data
	}
	client, clientErr := s.factory.CreateDouyinClient()
	if clientErr != nil {
		data["source"] = "local"
		return data
	}

	// 测试平台连通性
	if _, err := client.PrepareCertificate(ctx, token, &douyin.PrepareRequest{CertificateCode: "ping"}); err == nil {
		data["source"] = "live"
	}
	return data
}
