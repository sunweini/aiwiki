package handler

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// DouyinHandler 抖音渠道处理器，处理抖音核销记录、结算、门店配置和运营看板
type DouyinHandler struct {
	service *service.DouyinService
}

func NewDouyinHandler(svc *service.DouyinService) *DouyinHandler {
	return &DouyinHandler{service: svc}
}

// Dashboard 获取抖音运营看板数据，包含核销趋势和门店维度统计
func (h *DouyinHandler) Dashboard(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] Dashboard called by user %d", empID)

	var shopID *int64
	if id := c.Query("shop_id"); id != "" {
		s, _ := strconv.ParseInt(id, 10, 64)
		shopID = &s
	}

	log.Printf("[DouyinHandler] querying dashboard for shop_id: %v", shopID)
	data, err := h.service.GetDashboard(shopID)
	if err != nil {
		log.Printf("[DouyinHandler] Dashboard failed: %v", err)
		response.ServerError(c, "failed to get dashboard")
		return
	}

	// 获取年度核销趋势和门店维度数据，补充到看板响应中
	now := time.Now()
	startDate := fmt.Sprintf("%d-01-01", now.Year())
	endDate := now.Format("2006-01-02")
	trend, _ := h.service.GetVerifyTrend(shopID, startDate, endDate)
	byShop, _ := h.service.GetVerifyByShop(shopID, startDate, endDate)
	data["trend"] = trend
	data["by_shop"] = byShop

	log.Printf("[DouyinHandler] Dashboard succeeded")
	response.OK(c, data)
}

// ListRecords 获取抖音核销记录列表，支持按店铺筛选及分页
func (h *DouyinHandler) ListRecords(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] ListRecords called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if shopID := c.Query("shop_id"); shopID != "" {
		s, _ := strconv.ParseInt(shopID, 10, 64)
		filters["shop_id"] = s
	}

	log.Printf("[DouyinHandler] querying douyin records with filters: %v", filters)
	records, total, err := h.service.ListRecords(page, pageSize, filters)
	if err != nil {
		log.Printf("[DouyinHandler] ListRecords failed: %v", err)
		response.ServerError(c, "failed to list records")
		return
	}

	log.Printf("[DouyinHandler] ListRecords succeeded: %d records returned", len(records))
	response.OKPage(c, records, total, page, pageSize)
}

// ListSettlements 获取抖音结算记录列表，支持按店铺和状态筛选
func (h *DouyinHandler) ListSettlements(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] ListSettlements called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if shopID := c.Query("shop_id"); shopID != "" {
		s, _ := strconv.ParseInt(shopID, 10, 64)
		filters["shop_id"] = s
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	log.Printf("[DouyinHandler] querying douyin settlements with filters: %v", filters)
	settlements, total, err := h.service.ListSettlements(page, pageSize, filters)
	if err != nil {
		log.Printf("[DouyinHandler] ListSettlements failed: %v", err)
		response.ServerError(c, "failed to list settlements")
		return
	}

	log.Printf("[DouyinHandler] ListSettlements succeeded: %d records returned", len(settlements))
	response.OKPage(c, settlements, total, page, pageSize)
}

// TriggerSettlement 手动触发抖音结算，指定店铺和日期
func (h *DouyinHandler) TriggerSettlement(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] TriggerSettlement called by user %d", empID)

	var req struct {
		ShopID int64  `json:"shop_id" binding:"required"` // 店铺ID，必填
		Date   string `json:"date" binding:"required"`    // 结算日期，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[DouyinHandler] triggering settlement for shop %d on date %s", req.ShopID, req.Date)
	settlement, err := h.service.TriggerSettlement(req.ShopID, req.Date)
	if err != nil {
		log.Printf("[DouyinHandler] TriggerSettlement failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[DouyinHandler] TriggerSettlement succeeded: settlement %d", settlement.ID)
	response.OK(c, settlement)
}

// ListStores 获取抖音门店映射列表，展示平台店铺与抖音门店的绑定关系
func (h *DouyinHandler) ListStores(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] ListStores called by user %d", empID)

	mappings, err := h.service.ListStoreMappings()
	if err != nil {
		log.Printf("[DouyinHandler] ListStores failed: %v", err)
		response.ServerError(c, "failed to list store mappings")
		return
	}

	log.Printf("[DouyinHandler] ListStores succeeded: %d mappings returned", len(mappings))
	response.OK(c, mappings)
}

// UpsertStore 新增或更新抖音门店映射关系
func (h *DouyinHandler) UpsertStore(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] UpsertStore called by user %d", empID)

	var mapping model.DouyinStoreMapping
	if err := c.ShouldBindJSON(&mapping); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[DouyinHandler] upserting store mapping: shop %d -> douyin %s", mapping.ShopID, mapping.POIID)
	if err := h.service.UpsertStoreMapping(&mapping); err != nil {
		log.Printf("[DouyinHandler] UpsertStore failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[DouyinHandler] UpsertStore succeeded")
	response.OK(c, mapping)
}

// GetConfig 获取抖音渠道配置信息，包含回调地址和应用密钥
func (h *DouyinHandler) GetConfig(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] GetConfig called by user %d", empID)

	cfg, err := h.service.GetConfig()
	if err != nil {
		// 配置不存在时返回空值，不报错
		response.OK(c, map[string]interface{}{"client_key": "", "callback_url": "", "status": 0})
		return
	}

	log.Printf("[DouyinHandler] GetConfig succeeded")
	response.OK(c, cfg)
}

// UpdateConfig 更新抖音渠道配置，支持动态修改回调地址等参数
func (h *DouyinHandler) UpdateConfig(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] UpdateConfig called by user %d", empID)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[DouyinHandler] updating config with fields: %v", updates)
	if err := h.service.UpdateConfig(updates); err != nil {
		log.Printf("[DouyinHandler] UpdateConfig failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[DouyinHandler] UpdateConfig succeeded")
	response.OK(c, nil)
}

// GetStats 获取抖音核销统计数据，用于记录页顶部指标展示
func (h *DouyinHandler) GetStats(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] GetStats called by user %d", empID)

	data, err := h.service.GetDashboard(nil)
	if err != nil {
		log.Printf("[DouyinHandler] GetStats failed: %v", err)
		response.ServerError(c, "failed to get stats")
		return
	}

	log.Printf("[DouyinHandler] GetStats succeeded")
	response.OK(c, data)
}

// QueryCoupon 验券码查询 — 从抖音平台实时查询券码状态
func (h *DouyinHandler) QueryCoupon(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] QueryCoupon called by user %d", empID)

	var req struct {
		ShopID     int64  `json:"shop_id" binding:"required"`      // 店铺ID，必填
		CouponCode string `json:"coupon_code" binding:"required"` // 券码，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	info, err := h.service.QueryCouponFromPlatform(c.Request.Context(), req.ShopID, req.CouponCode)
	if err != nil {
		log.Printf("[DouyinHandler] QueryCoupon failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[DouyinHandler] QueryCoupon succeeded: product=%s", info.ProductName)
	response.OK(c, info)
}

// VerifyCoupon 实际核销 — 调用抖音平台API完成验券
func (h *DouyinHandler) VerifyCoupon(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[DouyinHandler] VerifyCoupon called by user %d", empID)

	var req struct {
		ShopID     int64  `json:"shop_id" binding:"required"`      // 店铺ID，必填
		POIID      string `json:"poi_id"`                         // 抖音门店POI ID
		CouponCode string `json:"coupon_code" binding:"required"` // 券码，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	record, err := h.service.VerifyCouponOnPlatform(c.Request.Context(), req.ShopID, req.POIID, req.CouponCode, empID)
	if err != nil {
		log.Printf("[DouyinHandler] VerifyCoupon failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[DouyinHandler] VerifyCoupon succeeded: record %d", record.ID)
	response.OK(c, record)
}

// RevokeVerify 撤销验券
func (h *DouyinHandler) RevokeVerify(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	verifyNo := c.Param("verify_no")
	log.Printf("[DouyinHandler] RevokeVerify called by user %d for %s", empID, verifyNo)

	var req struct {
		Reason string `json:"reason"` // 撤销原因
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	if err := h.service.RevokeVerify(c.Request.Context(), verifyNo, req.Reason); err != nil {
		log.Printf("[DouyinHandler] RevokeVerify failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[DouyinHandler] RevokeVerify succeeded: %s", verifyNo)
	response.OK(c, nil)
}
