package service

import (
	"context"
	"fmt"
	"log"
	"math"
	"time"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"
	"yfsc-platform-v2/backend/pkg/meituan"

	"gorm.io/gorm"
)

type MeituanService struct {
	db      *gorm.DB
	repo    *repository.PaymentRepo
	factory *PlatformClientFactory
}

func NewMeituanService(db *gorm.DB, paymentRepo *repository.PaymentRepo, factory *PlatformClientFactory) *MeituanService {
	return &MeituanService{db: db, repo: paymentRepo, factory: factory}
}

// GetDashboard 获取美团核销仪表盘数据：总核销数、总金额、待结算金额
func (s *MeituanService) GetDashboard(shopID *int64) (map[string]interface{}, error) {
	log.Printf("[MeituanService] GetDashboard called, shopID: %v", shopID)
	query := s.db.Model(&model.MeituanVerifyRecord{})
	if shopID != nil {
		query = query.Where("shop_id = ?", *shopID)
	}

	var totalVerify int64
	var totalAmount float64
	var pendingAmount float64
	query.Count(&totalVerify)
	if err := query.Select("COALESCE(sum(amount), 0)").Scan(&totalAmount).Error; err != nil {
		log.Printf("[MeituanService] GetDashboard failed: %v", err)
		return nil, err
	}
	if err := s.db.Model(&model.MeituanSettlement{}).Where("status = ?", "待结算").
		Select("COALESCE(sum(settlement_amount), 0)").Scan(&pendingAmount).Error; err != nil {
		log.Printf("[MeituanService] GetDashboard failed: %v", err)
		return nil, err
	}

	result := map[string]interface{}{
		"total_verify":   totalVerify,
		"total_amount":   totalAmount,
		"pending_amount": pendingAmount,
	}
	log.Printf("[MeituanService] GetDashboard succeeded: totalVerify=%d, totalAmount=%.2f", totalVerify, totalAmount)
	return result, nil
}

// ListRecords 分页查询美团验券记录，支持条件过滤
func (s *MeituanService) ListRecords(page, pageSize int, filters map[string]interface{}) ([]model.MeituanVerifyRecord, int64, error) {
	log.Printf("[MeituanService] ListRecords called, page: %d, pageSize: %d", page, pageSize)
	var records []model.MeituanVerifyRecord
	var total int64

	query := s.db.Model(&model.MeituanVerifyRecord{}).Preload("Shop")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}
	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&records).Error; err != nil {
		log.Printf("[MeituanService] ListRecords failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[MeituanService] ListRecords succeeded: total %d", total)
	return records, total, nil
}

// ListSettlements 分页查询美团结算记录，支持条件过滤
func (s *MeituanService) ListSettlements(page, pageSize int, filters map[string]interface{}) ([]model.MeituanSettlement, int64, error) {
	log.Printf("[MeituanService] ListSettlements called, page: %d, pageSize: %d", page, pageSize)
	var settlements []model.MeituanSettlement
	var total int64

	query := s.db.Model(&model.MeituanSettlement{}).Preload("Shop")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}
	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&settlements).Error; err != nil {
		log.Printf("[MeituanService] ListSettlements failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[MeituanService] ListSettlements succeeded: total %d", total)
	return settlements, total, nil
}

// ListStoreMappings 查询所有美团店铺映射关系
func (s *MeituanService) ListStoreMappings() ([]model.MeituanStoreMapping, error) {
	log.Printf("[MeituanService] ListStoreMappings called")
	var mappings []model.MeituanStoreMapping
	err := s.db.Preload("Shop").Find(&mappings).Error
	if err != nil {
		log.Printf("[MeituanService] ListStoreMappings failed: %v", err)
	}
	return mappings, err
}

// UpsertStoreMapping 新增或更新美团店铺映射关系
func (s *MeituanService) UpsertStoreMapping(mapping *model.MeituanStoreMapping) error {
	log.Printf("[MeituanService] UpsertStoreMapping called, shopID: %d, externalStoreID: %s", mapping.ShopID, mapping.ExternalStoreID)
	var existing model.MeituanStoreMapping
	err := s.db.Where("shop_id = ? AND external_store_id = ?", mapping.ShopID, mapping.ExternalStoreID).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		if err := s.db.Create(mapping).Error; err != nil {
			log.Printf("[MeituanService] UpsertStoreMapping failed: create error %v", err)
			return err
		}
		log.Printf("[MeituanService] UpsertStoreMapping succeeded: new mapping created")
		return nil
	}
	if err != nil {
		log.Printf("[MeituanService] UpsertStoreMapping failed: lookup error %v", err)
		return err
	}
	if err := s.db.Model(&model.MeituanStoreMapping{}).Where("id = ?", existing.ID).Updates(map[string]interface{}{
		"auth_status": mapping.AuthStatus, "sync_status": mapping.SyncStatus,
	}).Error; err != nil {
		log.Printf("[MeituanService] UpsertStoreMapping failed: update error %v", err)
		return err
	}
	log.Printf("[MeituanService] UpsertStoreMapping succeeded: existing mapping updated")
	return nil
}

type VerifyTrendPoint struct {
	Date   string  `json:"date"`
	Count  int64   `json:"count"`
	Amount float64 `json:"amount"`
}

// GetVerifyTrend 获取美团核销趋势（按日期聚合数量和金额）
func (s *MeituanService) GetVerifyTrend(shopID *int64, startDate, endDate string) ([]VerifyTrendPoint, error) {
	log.Printf("[MeituanService] GetVerifyTrend called, startDate: %s, endDate: %s", startDate, endDate)
	query := s.db.Model(&model.MeituanVerifyRecord{}).
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
		log.Printf("[MeituanService] GetVerifyTrend failed: %v", err)
		return nil, err
	}

	var trend []VerifyTrendPoint
	for _, r := range rows {
		trend = append(trend, VerifyTrendPoint{Date: r.Date, Count: r.Count, Amount: math.Round(r.Amount*100) / 100})
	}
	log.Printf("[MeituanService] GetVerifyTrend succeeded: %d data points", len(trend))
	return trend, nil
}

// GetVerifyByShop 按店铺维度统计美团核销数据
func (s *MeituanService) GetVerifyByShop(shopID *int64, startDate, endDate string) ([]map[string]interface{}, error) {
	log.Printf("[MeituanService] GetVerifyByShop called, startDate: %s, endDate: %s", startDate, endDate)
	query := s.db.Model(&model.MeituanVerifyRecord{}).
		Joins("LEFT JOIN shop ON shop.id = meituan_verify_record.shop_id").
		Where("meituan_verify_record.verified_at >= ? AND meituan_verify_record.verified_at <= ?", startDate, endDate+" 23:59:59")
	if shopID != nil {
		query = query.Where("meituan_verify_record.shop_id = ?", *shopID)
	}

	var rows []struct {
		ShopName string
		Count    int64
		Amount   float64
	}
	if err := query.Select("shop.name as shop_name, COUNT(*) as count, COALESCE(SUM(meituan_verify_record.amount), 0) as amount").
		Group("shop.name").Order("amount DESC").Scan(&rows).Error; err != nil {
		log.Printf("[MeituanService] GetVerifyByShop failed: %v", err)
		return nil, err
	}

	var result []map[string]interface{}
	for _, r := range rows {
		result = append(result, map[string]interface{}{
			"shop_name": r.ShopName, "count": r.Count, "amount": math.Round(r.Amount*100) / 100,
		})
	}
	log.Printf("[MeituanService] GetVerifyByShop succeeded: %d shops", len(result))
	return result, nil
}

// TriggerSettlement 触发美团结算：汇总指定店铺日期的核销记录，生成结算单
func (s *MeituanService) TriggerSettlement(shopID int64, date string) (*model.MeituanSettlement, error) {
	log.Printf("[MeituanService] TriggerSettlement called, shopID: %d, date: %s", shopID, date)
	var records []model.MeituanVerifyRecord
	if err := s.db.Where("shop_id = ? AND DATE(verified_at) = ?", shopID, date).
		Find(&records).Error; err != nil {
		log.Printf("[MeituanService] TriggerSettlement failed: query records error %v", err)
		return nil, err
	}
	if len(records) == 0 {
		log.Printf("[MeituanService] TriggerSettlement failed: no verify records for shop %d on %s", shopID, date)
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

	batchNo := fmt.Sprintf("MT-%s-%04d", date[:10], shopID)
	settlement := &model.MeituanSettlement{
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
		log.Printf("[MeituanService] TriggerSettlement failed: create settlement error %v", err)
		return nil, err
	}
	log.Printf("[MeituanService] TriggerSettlement succeeded: batchNo=%s, count=%d, amount=%.2f", batchNo, verifyCount, settlementAmount)
	return settlement, nil
}

// GetConfig 获取美团API配置
func (s *MeituanService) GetConfig() (*model.MeituanApiConfig, error) {
	log.Printf("[MeituanService] GetConfig called")
	var cfg model.MeituanApiConfig
	err := s.db.First(&cfg).Error
	if err != nil {
		log.Printf("[MeituanService] GetConfig failed: %v", err)
		return nil, err
	}
	return &cfg, nil
}

// UpdateConfig 更新美团API配置
func (s *MeituanService) UpdateConfig(updates map[string]interface{}) error {
	log.Printf("[MeituanService] UpdateConfig called")
	if err := s.db.Model(&model.MeituanApiConfig{}).Where("id > 0").Updates(updates).Error; err != nil {
		log.Printf("[MeituanService] UpdateConfig failed: %v", err)
		return err
	}
	log.Printf("[MeituanService] UpdateConfig succeeded")
	return nil
}

// QueryCouponFromPlatform 从美团平台实时查询券码状态
func (s *MeituanService) QueryCouponFromPlatform(ctx context.Context, shopID int64, couponCode string) (*meituan.CouponInfo, error) {
	log.Printf("[MeituanService] QueryCouponFromPlatform called, shopID: %d, code: %s", shopID, couponCode)
	token, err := s.factory.GetStoreToken(ctx, "meituan", shopID)
	if err != nil {
		return nil, fmt.Errorf("门店未授权，请先完成门店绑定: %w", err)
	}
	client, err := s.factory.CreateMeituanClient()
	if err != nil {
		return nil, err
	}
	info, err := client.PrepareCoupon(token, &meituan.PrepareRequest{CouponCode: couponCode})
	if err != nil {
		log.Printf("[MeituanService] QueryCouponFromPlatform failed: %v", err)
		return nil, err
	}
	log.Printf("[MeituanService] QueryCouponFromPlatform succeeded: product=%s, price=%.2f", info.ProductName, info.Price)
	return info, nil
}

// VerifyCouponOnPlatform 实际核销：宣券+验券+持久化
func (s *MeituanService) VerifyCouponOnPlatform(ctx context.Context, shopID int64, couponCode string, operatorID int64) (*model.MeituanVerifyRecord, error) {
	log.Printf("[MeituanService] VerifyCouponOnPlatform called, shopID: %d, code: %s, operator: %d", shopID, couponCode, operatorID)
	token, err := s.factory.GetStoreToken(ctx, "meituan", shopID)
	if err != nil {
		return nil, fmt.Errorf("门店未授权: %w", err)
	}
	client, err := s.factory.CreateMeituanClient()
	if err != nil {
		return nil, err
	}

	// Step 1: 宣券
	prepInfo, err := client.PrepareCoupon(token, &meituan.PrepareRequest{CouponCode: couponCode})
	if err != nil {
		return nil, fmt.Errorf("宣券失败: %w", err)
	}

	// Step 2: 验券
	idempotent := fmt.Sprintf("verify-%d-%s-%d", shopID, couponCode, time.Now().Unix())
	consumeResult, err := client.ConsumeCoupon(token, &meituan.ConsumeRequest{
		Codes:      []string{couponCode},
		Idempotent: idempotent,
	})
	if err != nil {
		return nil, fmt.Errorf("验券失败: %w", err)
	}
	if !consumeResult.Success {
		return nil, fmt.Errorf("验券未成功: %s", consumeResult.Message)
	}

	// Step 3: 持久化
	record := &model.MeituanVerifyRecord{
		VerifyNo:         fmt.Sprintf("MT%s%s", couponCode, time.Now().Format("20060102150405")),
		ShopID:           shopID,
		CouponName:       prepInfo.ProductName,
		Amount:           prepInfo.Price,
		VerifiedAt:       PtrTime(time.Now()),
		OperatorID:       operatorID,
	}
	if err := s.db.Create(record).Error; err != nil {
		log.Printf("[MeituanService] VerifyCouponOnPlatform persist failed: %v", err)
		return nil, err
	}
	log.Printf("[MeituanService] VerifyCouponOnPlatform succeeded: record %d", record.ID)
	return record, nil
}

// RevokeVerify 撤销美团验券
func (s *MeituanService) RevokeVerify(ctx context.Context, verifyNo string, reason string) error {
	log.Printf("[MeituanService] RevokeVerify called, verifyNo: %s, reason: %s", verifyNo, reason)
	var record model.MeituanVerifyRecord
	if err := s.db.Where("verify_no = ?", verifyNo).First(&record).Error; err != nil {
		return fmt.Errorf("核销记录不存在: %w", err)
	}

	token, err := s.factory.GetStoreToken(ctx, "meituan", record.ShopID)
	if err != nil {
		return err
	}
	client, err := s.factory.CreateMeituanClient()
	if err != nil {
		return err
	}

	if err := client.ReverseConsume(token, verifyNo, ""); err != nil {
		return fmt.Errorf("平台撤销失败: %w", err)
	}

	if err := s.db.Model(&record).Updates(map[string]interface{}{
		"settlement_amount": 0,
	}).Error; err != nil {
		return err
	}
	log.Printf("[MeituanService] RevokeVerify succeeded: verifyNo %s", verifyNo)
	return nil
}

// EnrichDashboard 用平台实时数据增强看板
func (s *MeituanService) EnrichDashboard(ctx context.Context, shopID int64, data map[string]interface{}) map[string]interface{} {
	if s.factory == nil {
		data["source"] = "local"
		return data
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	token, tokenErr := s.factory.GetStoreToken(ctx, "meituan", shopID)
	if tokenErr != nil {
		data["source"] = "local"
		return data
	}
	client, clientErr := s.factory.CreateMeituanClient()
	if clientErr != nil {
		data["source"] = "local"
		return data
	}

	// 测试平台连通性
	if _, err := client.PrepareCoupon(token, &meituan.PrepareRequest{CouponCode: "ping"}); err == nil {
		data["source"] = "live"
	}
	return data
}
