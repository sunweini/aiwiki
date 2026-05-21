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

// MeituanHandler 美团渠道处理器，处理美团核销记录、结算、门店配置和运营看板
type MeituanHandler struct {
	service *service.MeituanService
}

func NewMeituanHandler(svc *service.MeituanService) *MeituanHandler {
	return &MeituanHandler{service: svc}
}

// Dashboard 获取美团运营看板数据，包含核销趋势和门店维度统计
func (h *MeituanHandler) Dashboard(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] Dashboard called by user %d", empID)

	var shopID *int64
	if id := c.Query("shop_id"); id != "" {
		s, _ := strconv.ParseInt(id, 10, 64)
		shopID = &s
	}

	log.Printf("[MeituanHandler] querying dashboard for shop_id: %v", shopID)
	data, err := h.service.GetDashboard(shopID)
	if err != nil {
		log.Printf("[MeituanHandler] Dashboard failed: %v", err)
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

	log.Printf("[MeituanHandler] Dashboard succeeded")
	response.OK(c, data)
}

// ListRecords 获取美团核销记录列表，支持按店铺筛选及分页
func (h *MeituanHandler) ListRecords(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] ListRecords called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if shopID := c.Query("shop_id"); shopID != "" {
		s, _ := strconv.ParseInt(shopID, 10, 64)
		filters["shop_id"] = s
	}

	log.Printf("[MeituanHandler] querying meituan records with filters: %v", filters)
	records, total, err := h.service.ListRecords(page, pageSize, filters)
	if err != nil {
		log.Printf("[MeituanHandler] ListRecords failed: %v", err)
		response.ServerError(c, "failed to list records")
		return
	}

	log.Printf("[MeituanHandler] ListRecords succeeded: %d records returned", len(records))
	response.OKPage(c, records, total, page, pageSize)
}

// ListSettlements 获取美团结算记录列表，支持按店铺和状态筛选
func (h *MeituanHandler) ListSettlements(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] ListSettlements called by user %d", empID)

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

	log.Printf("[MeituanHandler] querying meituan settlements with filters: %v", filters)
	settlements, total, err := h.service.ListSettlements(page, pageSize, filters)
	if err != nil {
		log.Printf("[MeituanHandler] ListSettlements failed: %v", err)
		response.ServerError(c, "failed to list settlements")
		return
	}

	log.Printf("[MeituanHandler] ListSettlements succeeded: %d records returned", len(settlements))
	response.OKPage(c, settlements, total, page, pageSize)
}

// TriggerSettlement 手动触发美团结算，指定店铺和日期
func (h *MeituanHandler) TriggerSettlement(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] TriggerSettlement called by user %d", empID)

	var req struct {
		ShopID int64  `json:"shop_id" binding:"required"` // 店铺ID，必填
		Date   string `json:"date" binding:"required"`    // 结算日期，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[MeituanHandler] triggering settlement for shop %d on date %s", req.ShopID, req.Date)
	settlement, err := h.service.TriggerSettlement(req.ShopID, req.Date)
	if err != nil {
		log.Printf("[MeituanHandler] TriggerSettlement failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[MeituanHandler] TriggerSettlement succeeded: settlement %d", settlement.ID)
	response.OK(c, settlement)
}

// ListStores 获取美团门店映射列表，展示平台店铺与美团门店的绑定关系
func (h *MeituanHandler) ListStores(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] ListStores called by user %d", empID)

	mappings, err := h.service.ListStoreMappings()
	if err != nil {
		log.Printf("[MeituanHandler] ListStores failed: %v", err)
		response.ServerError(c, "failed to list store mappings")
		return
	}

	log.Printf("[MeituanHandler] ListStores succeeded: %d mappings returned", len(mappings))
	response.OK(c, mappings)
}

// UpsertStore 新增或更新美团门店映射关系
func (h *MeituanHandler) UpsertStore(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] UpsertStore called by user %d", empID)

	var mapping model.MeituanStoreMapping
	if err := c.ShouldBindJSON(&mapping); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[MeituanHandler] upserting store mapping: shop %d -> meituan %s", mapping.ShopID, mapping.ExternalStoreID)
	if err := h.service.UpsertStoreMapping(&mapping); err != nil {
		log.Printf("[MeituanHandler] UpsertStore failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[MeituanHandler] UpsertStore succeeded")
	response.OK(c, mapping)
}

// GetConfig 获取美团渠道配置信息，包含回调地址和应用密钥
func (h *MeituanHandler) GetConfig(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] GetConfig called by user %d", empID)

	cfg, err := h.service.GetConfig()
	if err != nil {
		// 配置不存在时返回空值，不报错
		response.OK(c, map[string]interface{}{"app_id": "", "callback_url": "", "status": 0})
		return
	}

	log.Printf("[MeituanHandler] GetConfig succeeded")
	response.OK(c, cfg)
}

// UpdateConfig 更新美团渠道配置，支持动态修改回调地址等参数
func (h *MeituanHandler) UpdateConfig(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] UpdateConfig called by user %d", empID)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[MeituanHandler] updating config with fields: %v", updates)
	if err := h.service.UpdateConfig(updates); err != nil {
		log.Printf("[MeituanHandler] UpdateConfig failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[MeituanHandler] UpdateConfig succeeded")
	response.OK(c, nil)
}

// QueryCoupon 验券码查询 — 从美团平台实时查询券码状态
func (h *MeituanHandler) QueryCoupon(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] QueryCoupon called by user %d", empID)

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
		log.Printf("[MeituanHandler] QueryCoupon failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[MeituanHandler] QueryCoupon succeeded: product=%s", info.ProductName)
	response.OK(c, info)
}

// VerifyCoupon 实际核销 — 调用美团平台API完成验券
func (h *MeituanHandler) VerifyCoupon(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[MeituanHandler] VerifyCoupon called by user %d", empID)

	var req struct {
		ShopID     int64  `json:"shop_id" binding:"required"`      // 店铺ID，必填
		CouponCode string `json:"coupon_code" binding:"required"` // 券码，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	record, err := h.service.VerifyCouponOnPlatform(c.Request.Context(), req.ShopID, req.CouponCode, empID)
	if err != nil {
		log.Printf("[MeituanHandler] VerifyCoupon failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[MeituanHandler] VerifyCoupon succeeded: record %d", record.ID)
	response.OK(c, record)
}

// RevokeVerify 撤销验券
func (h *MeituanHandler) RevokeVerify(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	verifyNo := c.Param("verify_no")
	log.Printf("[MeituanHandler] RevokeVerify called by user %d for %s", empID, verifyNo)

	var req struct {
		Reason string `json:"reason"` // 撤销原因
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	if err := h.service.RevokeVerify(c.Request.Context(), verifyNo, req.Reason); err != nil {
		log.Printf("[MeituanHandler] RevokeVerify failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[MeituanHandler] RevokeVerify succeeded: %s", verifyNo)
	response.OK(c, nil)
}
