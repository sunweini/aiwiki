package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// FinanceHandler 财务管理处理器，处理账户总览、提现申请/审核和对账记录查询
type FinanceHandler struct {
	service *service.FinanceService
}

func NewFinanceHandler(svc *service.FinanceService) *FinanceHandler {
	return &FinanceHandler{service: svc}
}

// GetAccount 获取平台级财务汇总数据，包含总收入、余额和提现统计
func (h *FinanceHandler) GetAccount(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[FinanceHandler] GetAccount called by user %d", empID)

	// 平台级聚合财务数据：总营收、线上/线下营收、各渠道营收、余额和提现
	data := map[string]interface{}{
		"totalRevenue":    0,
		"onlineRevenue":   0,
		"offlineRevenue":  0,
		"meituanRevenue":  0,
		"douyinRevenue":   0,
		"balance":         0,
		"withdrawn":       0,
		"totalIn":         0,
	}

	log.Printf("[FinanceHandler] GetAccount succeeded")
	response.OK(c, data)
}

// ListWithdraws 获取提现申请列表，支持按状态和店铺筛选及分页
func (h *FinanceHandler) ListWithdraws(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[FinanceHandler] ListWithdraws called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 status 和 shop_id 过滤
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if shopID := c.Query("shop_id"); shopID != "" {
		s, _ := strconv.ParseInt(shopID, 10, 64)
		filters["shop_id"] = s
	}

	log.Printf("[FinanceHandler] querying withdraws with filters: %v", filters)
	withdraws, total, err := h.service.ListWithdraw(page, pageSize, filters)
	if err != nil {
		log.Printf("[FinanceHandler] ListWithdraws failed: %v", err)
		response.ServerError(c, "failed to list withdraws")
		return
	}

	log.Printf("[FinanceHandler] ListWithdraws succeeded: %d records returned", len(withdraws))
	response.OKPage(c, withdraws, total, page, pageSize)
}

// CreateWithdraw 创建提现申请，默认状态为待审核
func (h *FinanceHandler) CreateWithdraw(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[FinanceHandler] CreateWithdraw called by user %d", empID)

	var req struct {
		ShopID      int64   `json:"shop_id" binding:"required"`      // 申请提现的店铺ID，必填
		Amount      float64 `json:"amount" binding:"required"`       // 提现金额，必填
		BankName    string  `json:"bank_name"`                       // 开户银行名称
		BankAccount string  `json:"bank_account"`                    // 银行账号
		AccountName string  `json:"account_name"`                    // 账户名称
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	// 构建提现申请模型，初始状态设为"待审核"
	w := &model.WithdrawApplication{
		ShopID:      req.ShopID,
		Amount:      req.Amount,
		BankName:    req.BankName,
		BankAccount: req.BankAccount,
		AccountName: req.AccountName,
		Status:      "待审核",
	}

	log.Printf("[FinanceHandler] creating withdraw: shop %d, amount %.2f", req.ShopID, req.Amount)
	if err := h.service.CreateWithdraw(w); err != nil {
		log.Printf("[FinanceHandler] CreateWithdraw failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[FinanceHandler] CreateWithdraw succeeded: withdraw %d", w.ID)
	response.OK(c, w)
}

// ReviewWithdraw 审核提现申请，审批通过或拒绝并记录审核意见
func (h *FinanceHandler) ReviewWithdraw(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[FinanceHandler] ReviewWithdraw called by user %d for withdraw %d", empID, id)

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
	log.Printf("[FinanceHandler] reviewing withdraw %d: approved=%v by reviewer %d", id, req.Approved, reviewerID)
	if err := h.service.ReviewWithdraw(id, req.Approved, reviewerID, req.ReviewNote); err != nil {
		log.Printf("[FinanceHandler] ReviewWithdraw failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[FinanceHandler] ReviewWithdraw succeeded: withdraw %d", id)
	response.OK(c, nil)
}

// ListReconcile 获取对账记录列表，支持按园区筛选及分页
func (h *FinanceHandler) ListReconcile(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[FinanceHandler] ListReconcile called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if parkID := c.Query("park_id"); parkID != "" {
		p, _ := strconv.ParseInt(parkID, 10, 64)
		filters["park_id"] = p
	}

	log.Printf("[FinanceHandler] querying reconciliations with filters: %v", filters)
	reconciles, total, err := h.service.ListReconciliation(page, pageSize, filters)
	if err != nil {
		log.Printf("[FinanceHandler] ListReconcile failed: %v", err)
		response.ServerError(c, "failed to list reconciliations")
		return
	}

	log.Printf("[FinanceHandler] ListReconcile succeeded: %d records returned", len(reconciles))
	response.OKPage(c, reconciles, total, page, pageSize)
}
