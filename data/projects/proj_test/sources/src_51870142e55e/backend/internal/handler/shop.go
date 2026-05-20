package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// ShopHandler 店铺管理处理器，处理店铺的增删改查、统计和二维码生成
type ShopHandler struct {
	service *service.ShopService
}

func NewShopHandler(svc *service.ShopService) *ShopHandler {
	return &ShopHandler{service: svc}
}

// List 获取店铺列表，支持按园区和状态筛选及分页
func (h *ShopHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ShopHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 park_id 和 status 过滤
	filters := make(map[string]interface{})
	if parkID := c.Query("park_id"); parkID != "" {
		p, _ := strconv.ParseInt(parkID, 10, 64)
		filters["park_id"] = p
	}
	if status := c.Query("status"); status != "" {
		s, _ := strconv.Atoi(status)
		filters["status"] = int8(s)
	}

	log.Printf("[ShopHandler] querying shops with filters: %v", filters)
	shops, total, err := h.service.List(page, pageSize, filters)
	if err != nil {
		log.Printf("[ShopHandler] List failed: %v", err)
		response.ServerError(c, "failed to list shops")
		return
	}

	log.Printf("[ShopHandler] List succeeded: %d records returned", len(shops))
	response.OKPage(c, shops, total, page, pageSize)
}

// GetByID 根据ID获取单个店铺详细信息
func (h *ShopHandler) GetByID(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ShopHandler] GetByID called by user %d for shop %d", empID, id)

	shop, err := h.service.GetByID(id)
	if err != nil {
		log.Printf("[ShopHandler] GetByID failed: %v", err)
		response.NotFound(c, "shop not found")
		return
	}

	log.Printf("[ShopHandler] GetByID succeeded: shop %d", id)
	response.OK(c, shop)
}

// Create 创建新店铺，默认状态为启用
func (h *ShopHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ShopHandler] Create called by user %d", empID)

	var req struct {
		Name    string `json:"name" binding:"required"`   // 店铺名称，必填
		Address string `json:"address"`                   // 店铺地址
		ParkID  int64  `json:"park_id" binding:"required"` // 所属园区ID，必填
		TypeID  int64  `json:"type_id"`                   // 店铺类型ID
		Status  int8   `json:"status"`                    // 状态：0-禁用，1-启用（默认1）
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}
	// 未指定状态时默认为启用(1)
	if req.Status == 0 {
		req.Status = 1
	}

	shop := &model.Shop{
		Name:    req.Name,
		Address: req.Address,
		ParkID:  req.ParkID,
		TypeID:  req.TypeID,
		Status:  req.Status,
	}

	log.Printf("[ShopHandler] creating shop: %s for park %d", req.Name, req.ParkID)
	if err := h.service.Create(shop); err != nil {
		log.Printf("[ShopHandler] Create failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[ShopHandler] Create succeeded: shop %d", shop.ID)
	response.OK(c, shop)
}

// Update 更新店铺信息，支持部分字段更新
func (h *ShopHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ShopHandler] Update called by user %d for shop %d", empID, id)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[ShopHandler] updating shop %d with fields: %v", id, updates)
	if err := h.service.Update(id, updates); err != nil {
		log.Printf("[ShopHandler] Update failed: %v", err)
		response.NotFound(c, "shop not found")
		return
	}

	log.Printf("[ShopHandler] Update succeeded: shop %d", id)
	response.OK(c, nil)
}

// Delete 删除指定店铺
func (h *ShopHandler) Delete(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ShopHandler] Delete called by user %d for shop %d", empID, id)

	if err := h.service.Delete(id); err != nil {
		log.Printf("[ShopHandler] Delete failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[ShopHandler] Delete succeeded: shop %d", id)
	response.OK(c, nil)
}

// Stats 获取店铺统计信息，返回店铺总数、启用数等汇总数据
func (h *ShopHandler) Stats(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ShopHandler] Stats called by user %d", empID)

	stats, err := h.service.Stats()
	if err != nil {
		log.Printf("[ShopHandler] Stats failed: %v", err)
		response.ServerError(c, "failed to get stats")
		return
	}

	log.Printf("[ShopHandler] Stats succeeded")
	response.OK(c, stats)
}

// GetQRCode 生成店铺二维码链接，用于线下扫码入口
func (h *ShopHandler) GetQRCode(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ShopHandler] GetQRCode called by user %d for shop %d", empID, id)

	baseURL := c.DefaultQuery("base_url", "")
	qrURL := h.service.GenerateQRCodeURL(id, baseURL)

	log.Printf("[ShopHandler] GetQRCode succeeded: shop %d -> %s", id, qrURL)
	response.OK(c, map[string]string{"qr_code_url": qrURL})
}
