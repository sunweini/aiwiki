package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// EmployeeHandler 员工管理处理器，处理员工的增删改查、状态切换和密码重置
type EmployeeHandler struct {
	service *service.EmployeeService
}

func NewEmployeeHandler(svc *service.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{service: svc}
}

// List 获取员工列表，支持按角色、状态和园区筛选及分页
func (h *EmployeeHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[EmployeeHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 role、status、park_id 过滤
	filters := make(map[string]interface{})
	if role := c.Query("role"); role != "" {
		filters["role"] = role
	}
	if status := c.Query("status"); status != "" {
		s, _ := strconv.Atoi(status)
		filters["status"] = int8(s)
	}
	if parkID := c.Query("park_id"); parkID != "" {
		p, _ := strconv.ParseInt(parkID, 10, 64)
		filters["park_id"] = p
	}

	log.Printf("[EmployeeHandler] querying employees with filters: %v", filters)
	employees, total, err := h.service.List(page, pageSize, filters)
	if err != nil {
		log.Printf("[EmployeeHandler] List failed: %v", err)
		response.ServerError(c, "failed to list employees")
		return
	}

	log.Printf("[EmployeeHandler] List succeeded: %d records returned", len(employees))
	response.OKPage(c, employees, total, page, pageSize)
}

// GetByID 根据ID获取单个员工详细信息
func (h *EmployeeHandler) GetByID(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[EmployeeHandler] GetByID called by user %d for employee %d", empID, id)

	emp, err := h.service.GetByID(id)
	if err != nil {
		log.Printf("[EmployeeHandler] GetByID failed: %v", err)
		response.NotFound(c, "employee not found")
		return
	}

	log.Printf("[EmployeeHandler] GetByID succeeded: employee %d", id)
	response.OK(c, emp)
}

// CreateEmployeeRequest 创建员工请求参数
type CreateEmployeeRequest struct {
	Username string `json:"username" binding:"required"`   // 登录用户名，必填
	Password string `json:"password" binding:"required"`   // 初始密码，必填
	RealName string `json:"real_name"`                     // 真实姓名
	Phone    string `json:"phone"`                         // 联系电话
	Gender   int8   `json:"gender"`                        // 性别：0-未知，1-男，2-女
	ParkID   *int64 `json:"park_id"`                       // 所属园区ID（可选）
	ShopID   *int64 `json:"shop_id"`                       // 所属店铺ID（可选）
	Role     string `json:"role" binding:"required"`       // 角色代码，必填
	Position string `json:"position"`                      // 职位名称
}

// Create 创建新员工，默认状态为启用
func (h *EmployeeHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[EmployeeHandler] Create called by user %d", empID)

	var req CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	// 将请求参数映射到员工模型，新创建员工默认状态为启用(1)
	emp := &model.Employee{
		Username:     req.Username,
		PasswordHash: req.Password,
		RealName:     req.RealName,
		Phone:        req.Phone,
		Gender:       req.Gender,
		ParkID:       req.ParkID,
		ShopID:       req.ShopID,
		Role:         req.Role,
		Position:     req.Position,
		Status:       1,
	}

	log.Printf("[EmployeeHandler] creating employee: %s with role: %s", req.Username, req.Role)
	if err := h.service.Create(emp); err != nil {
		log.Printf("[EmployeeHandler] Create failed: %v", err)
		response.Error(c, 409, err.Error())
		return
	}

	log.Printf("[EmployeeHandler] Create succeeded: employee %d", emp.ID)
	response.OK(c, emp)
}

// UpdateEmployeeRequest 更新员工请求参数（引用 service 层定义）
type UpdateEmployeeRequest = service.UpdateEmployeeRequest

// Update 更新员工信息，支持部分字段更新
func (h *EmployeeHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[EmployeeHandler] Update called by user %d for employee %d", empID, id)

	var req UpdateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[EmployeeHandler] updating employee %d with fields: %+v", id, req)
	if err := h.service.Update(id, req); err != nil {
		log.Printf("[EmployeeHandler] Update failed: %v", err)
		response.NotFound(c, "employee not found")
		return
	}

	log.Printf("[EmployeeHandler] Update succeeded: employee %d", id)
	response.OK(c, nil)
}

// Delete 删除指定员工
func (h *EmployeeHandler) Delete(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[EmployeeHandler] Delete called by user %d for employee %d", empID, id)

	if err := h.service.Delete(id); err != nil {
		log.Printf("[EmployeeHandler] Delete failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[EmployeeHandler] Delete succeeded: employee %d", id)
	response.OK(c, nil)
}

// ToggleStatus 切换员工启用/禁用状态
func (h *EmployeeHandler) ToggleStatus(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[EmployeeHandler] ToggleStatus called by user %d for employee %d", empID, id)

	var req struct {
		Status int8 `json:"status" binding:"required"` // 目标状态：1-启用，0-禁用
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid status")
		return
	}

	log.Printf("[EmployeeHandler] toggling employee %d to status %d", id, req.Status)
	if err := h.service.ToggleStatus(id, req.Status); err != nil {
		log.Printf("[EmployeeHandler] ToggleStatus failed: %v", err)
		response.ServerError(c, "failed to toggle status")
		return
	}

	log.Printf("[EmployeeHandler] ToggleStatus succeeded: employee %d now status %d", id, req.Status)
	response.OK(c, nil)
}

// ResetPassword 重置员工登录密码
func (h *EmployeeHandler) ResetPassword(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[EmployeeHandler] ResetPassword called by user %d for employee %d", empID, id)

	var req struct {
		NewPassword string `json:"new_password" binding:"required"` // 新密码，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid password")
		return
	}

	log.Printf("[EmployeeHandler] resetting password for employee %d", id)
	if err := h.service.ResetPassword(id, req.NewPassword); err != nil {
		log.Printf("[EmployeeHandler] ResetPassword failed: %v", err)
		response.ServerError(c, "failed to reset password")
		return
	}

	log.Printf("[EmployeeHandler] ResetPassword succeeded: employee %d", id)
	response.OK(c, nil)
}
