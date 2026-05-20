package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// OrderHandler 订单管理处理器，处理订单查询、核销和退款审核
type OrderHandler struct {
	service *service.OrderService
}

func NewOrderHandler(svc *service.OrderService) *OrderHandler {
	return &OrderHandler{service: svc}
}

// List 获取订单列表，支持按状态、店铺和用户筛选及分页
func (h *OrderHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[OrderHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 status、shop_id、user_id 过滤
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if shopID := c.Query("shop_id"); shopID != "" {
		s, _ := strconv.ParseInt(shopID, 10, 64)
		filters["shop_id"] = s
	}
	if userID := c.Query("user_id"); userID != "" {
		u, _ := strconv.ParseInt(userID, 10, 64)
		filters["user_id"] = u
	}

	log.Printf("[OrderHandler] querying orders with filters: %v", filters)
	orders, total, err := h.service.List(page, pageSize, filters)
	if err != nil {
		log.Printf("[OrderHandler] List failed: %v", err)
		response.ServerError(c, "failed to list orders")
		return
	}

	log.Printf("[OrderHandler] List succeeded: %d records returned", len(orders))
	response.OKPage(c, orders, total, page, pageSize)
}

// GetByID 根据ID获取单个订单详细信息
func (h *OrderHandler) GetByID(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[OrderHandler] GetByID called by user %d for order %d", empID, id)

	order, err := h.service.GetByID(id)
	if err != nil {
		log.Printf("[OrderHandler] GetByID failed: %v", err)
		response.NotFound(c, "order not found")
		return
	}

	log.Printf("[OrderHandler] GetByID succeeded: order %d", id)
	response.OK(c, order)
}

// Verify 核销订单，将订单状态标记为已核销
func (h *OrderHandler) Verify(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[OrderHandler] Verify called by user %d for order %d", empID, id)

	if err := h.service.Verify(id); err != nil {
		log.Printf("[OrderHandler] Verify failed: %v", err)
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[OrderHandler] Verify succeeded: order %d", id)
	response.OK(c, nil)
}

// Refund 创建退款申请，指定退款金额和原因
func (h *OrderHandler) Refund(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[OrderHandler] Refund called by user %d for order %d", empID, id)

	var req struct {
		UserID int64   `json:"user_id" binding:"required"` // 申请退款的用户ID，必填
		Amount float64 `json:"amount" binding:"required"`  // 退款金额，必填
		Reason string  `json:"reason"`                     // 退款原因
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[OrderHandler] creating refund for order %d: user %d, amount %.2f", id, req.UserID, req.Amount)
	if err := h.service.CreateRefund(id, req.UserID, req.Amount, req.Reason); err != nil {
		log.Printf("[OrderHandler] Refund failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[OrderHandler] Refund succeeded: order %d", id)
	response.OK(c, nil)
}

// ListRefunds 获取退款申请列表，支持按状态筛选及分页
func (h *OrderHandler) ListRefunds(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[OrderHandler] ListRefunds called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	log.Printf("[OrderHandler] querying refunds with filters: %v", filters)
	refunds, total, err := h.service.ListRefunds(page, pageSize, filters)
	if err != nil {
		log.Printf("[OrderHandler] ListRefunds failed: %v", err)
		response.ServerError(c, "failed to list refunds")
		return
	}

	log.Printf("[OrderHandler] ListRefunds succeeded: %d records returned", len(refunds))
	response.OKPage(c, refunds, total, page, pageSize)
}

// ReviewRefund 审核退款申请，由当前登录员工作为审核人
func (h *OrderHandler) ReviewRefund(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[OrderHandler] ReviewRefund called by user %d for refund %d", empID, id)

	var req struct {
		Approved   bool   `json:"approved"`    // 是否批准：true-通过，false-拒绝
		ReviewNote string `json:"review_note"` // 审核备注
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	// 使用当前登录员工ID作为审核人
	reviewerID := c.GetInt64("employee_id")
	log.Printf("[OrderHandler] reviewing refund %d: approved=%v by reviewer %d", id, req.Approved, reviewerID)
	if err := h.service.ReviewRefund(id, req.Approved, reviewerID, req.ReviewNote); err != nil {
		log.Printf("[OrderHandler] ReviewRefund failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[OrderHandler] ReviewRefund succeeded: refund %d", id)
	response.OK(c, nil)
}

// RefundHandler 独立退款处理器，提供额外的退款管理接口
type RefundHandler struct {
	service *service.OrderService
}

func NewRefundHandler(svc *service.OrderService) *RefundHandler {
	return &RefundHandler{service: svc}
}

// List 获取退款列表（RefundHandler 版本），支持按状态筛选及分页
func (h *RefundHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[RefundHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	log.Printf("[RefundHandler] querying refunds with filters: %v", filters)
	refunds, total, err := h.service.ListRefunds(page, pageSize, filters)
	if err != nil {
		log.Printf("[RefundHandler] List failed: %v", err)
		response.ServerError(c, "failed to list refunds")
		return
	}

	log.Printf("[RefundHandler] List succeeded: %d records returned", len(refunds))
	response.OKPage(c, refunds, total, page, pageSize)
}

// Review 审核退款（RefundHandler 版本），审核人ID由请求体传入
func (h *RefundHandler) Review(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[RefundHandler] Review called by user %d for refund %d", empID, id)

	var req struct {
		Approved   bool   `json:"approved"`              // 是否批准
		ReviewerID int64  `json:"reviewer_id"`           // 审核人ID
		ReviewNote string `json:"review_note"`           // 审核备注
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[RefundHandler] reviewing refund %d: approved=%v by reviewer %d", id, req.Approved, req.ReviewerID)
	if err := h.service.ReviewRefund(id, req.Approved, req.ReviewerID, req.ReviewNote); err != nil {
		log.Printf("[RefundHandler] Review failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[RefundHandler] Review succeeded: refund %d", id)
	response.OK(c, nil)
}
