package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// UserHandler C端用户管理处理器，处理用户的增删改查、统计和充值记录查询
type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
	return &UserHandler{service: svc}
}

// List 获取C端用户列表，支持按手机号和会员等级筛选及分页
func (h *UserHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[UserHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 phone 和 member_level 过滤
	filters := make(map[string]interface{})
	if phone := c.Query("phone"); phone != "" {
		filters["phone"] = phone
	}
	if memberLevel := c.Query("member_level"); memberLevel != "" {
		filters["member_level"] = memberLevel
	}

	log.Printf("[UserHandler] querying users with filters: %v", filters)
	users, total, err := h.service.List(page, pageSize, filters)
	if err != nil {
		log.Printf("[UserHandler] List failed: %v", err)
		response.ServerError(c, "failed to list users")
		return
	}

	log.Printf("[UserHandler] List succeeded: %d records returned", len(users))
	response.OKPage(c, users, total, page, pageSize)
}

// GetByID 根据ID获取单个C端用户详细信息
func (h *UserHandler) GetByID(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[UserHandler] GetByID called by user %d for user %d", empID, id)

	user, err := h.service.GetByID(id)
	if err != nil {
		log.Printf("[UserHandler] GetByID failed: %v", err)
		response.NotFound(c, "user not found")
		return
	}

	log.Printf("[UserHandler] GetByID succeeded: user %d", id)
	response.OK(c, user)
}

// Create 创建新C端用户
func (h *UserHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[UserHandler] Create called by user %d", empID)

	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[UserHandler] creating user: phone=%s", user.Phone)
	if err := h.service.Create(&user); err != nil {
		log.Printf("[UserHandler] Create failed: %v", err)
		response.Error(c, 409, err.Error())
		return
	}

	log.Printf("[UserHandler] Create succeeded: user %d", user.ID)
	response.OK(c, user)
}

// Update 更新C端用户信息，支持部分字段更新
func (h *UserHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[UserHandler] Update called by user %d for user %d", empID, id)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[UserHandler] updating user %d with fields: %v", id, updates)
	if err := h.service.Update(id, updates); err != nil {
		log.Printf("[UserHandler] Update failed: %v", err)
		response.NotFound(c, "user not found")
		return
	}

	log.Printf("[UserHandler] Update succeeded: user %d", id)
	response.OK(c, nil)
}

// Stats 获取C端用户统计信息，返回用户总数、会员分布等汇总数据
func (h *UserHandler) Stats(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[UserHandler] Stats called by user %d", empID)

	stats, err := h.service.Stats()
	if err != nil {
		log.Printf("[UserHandler] Stats failed: %v", err)
		response.ServerError(c, "failed to get stats")
		return
	}

	log.Printf("[UserHandler] Stats succeeded")
	response.OK(c, stats)
}

// GetRecharges 获取指定用户的充值记录列表，支持分页
func (h *UserHandler) GetRecharges(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	userID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[UserHandler] GetRecharges called by user %d for user %d", empID, userID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	log.Printf("[UserHandler] querying recharges for user %d", userID)
	records, total, err := h.service.RechargeList(userID, page, pageSize)
	if err != nil {
		log.Printf("[UserHandler] GetRecharges failed: %v", err)
		response.ServerError(c, "failed to list recharges")
		return
	}

	log.Printf("[UserHandler] GetRecharges succeeded: %d records returned", len(records))
	response.OKPage(c, records, total, page, pageSize)
}
