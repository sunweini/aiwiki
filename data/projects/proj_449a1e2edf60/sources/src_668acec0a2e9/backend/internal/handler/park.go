package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// ParkHandler 园区管理处理器，处理园区的增删改查和状态切换
type ParkHandler struct {
	service *service.ParkService
}

func NewParkHandler(svc *service.ParkService) *ParkHandler {
	return &ParkHandler{service: svc}
}

// List 获取园区列表，支持按状态筛选及分页
func (h *ParkHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ParkHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 status 过滤
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		s, _ := strconv.Atoi(status)
		filters["status"] = int8(s)
	}

	log.Printf("[ParkHandler] querying parks with filters: %v", filters)
	parks, total, err := h.service.List(page, pageSize, filters)
	if err != nil {
		log.Printf("[ParkHandler] List failed: %v", err)
		response.ServerError(c, "failed to list parks")
		return
	}

	log.Printf("[ParkHandler] List succeeded: %d records returned", len(parks))
	response.OKPage(c, parks, total, page, pageSize)
}

// GetByID 根据ID获取单个园区详细信息
func (h *ParkHandler) GetByID(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ParkHandler] GetByID called by user %d for park %d", empID, id)

	park, err := h.service.GetByID(id)
	if err != nil {
		log.Printf("[ParkHandler] GetByID failed: %v", err)
		response.NotFound(c, "park not found")
		return
	}

	log.Printf("[ParkHandler] GetByID succeeded: park %d", id)
	response.OK(c, park)
}

// Create 创建新园区，默认状态为启用
func (h *ParkHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ParkHandler] Create called by user %d", empID)

	var req struct {
		Name          string `json:"name" binding:"required"`     // 园区名称，必填
		Code          string `json:"code" binding:"required"`     // 园区编码，必填
		Address       string `json:"address"`                     // 园区地址
		ContactName   string `json:"contact_name"`                // 联系人姓名
		ContactPhone  string `json:"contact_phone"`               // 联系电话
		BusinessHours string `json:"business_hours"`              // 营业时间
		Description   string `json:"description"`                 // 园区描述
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	// 构建园区模型，新创建园区默认状态为启用(1)
	park := &model.Park{
		Name:          req.Name,
		Code:          req.Code,
		Address:       req.Address,
		ContactName:   req.ContactName,
		ContactPhone:  req.ContactPhone,
		BusinessHours: req.BusinessHours,
		Description:   req.Description,
		Status:        1,
	}

	log.Printf("[ParkHandler] creating park: %s (code: %s)", req.Name, req.Code)
	if err := h.service.Create(park); err != nil {
		log.Printf("[ParkHandler] Create failed: %v", err)
		response.Error(c, 409, err.Error())
		return
	}

	log.Printf("[ParkHandler] Create succeeded: park %d", park.ID)
	response.OK(c, park)
}

// Update 更新园区信息，支持部分字段更新
func (h *ParkHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ParkHandler] Update called by user %d for park %d", empID, id)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[ParkHandler] updating park %d with fields: %v", id, updates)
	if err := h.service.Update(id, updates); err != nil {
		log.Printf("[ParkHandler] Update failed: %v", err)
		response.NotFound(c, "park not found")
		return
	}

	log.Printf("[ParkHandler] Update succeeded: park %d", id)
	response.OK(c, nil)
}

// Delete 删除指定园区
func (h *ParkHandler) Delete(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ParkHandler] Delete called by user %d for park %d", empID, id)

	if err := h.service.Delete(id); err != nil {
		log.Printf("[ParkHandler] Delete failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[ParkHandler] Delete succeeded: park %d", id)
	response.OK(c, nil)
}

// ToggleStatus 切换园区启用/禁用状态
func (h *ParkHandler) ToggleStatus(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ParkHandler] ToggleStatus called by user %d for park %d", empID, id)

	var req struct {
		Status int8 `json:"status" binding:"required"` // 目标状态：1-启用，0-禁用
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid status")
		return
	}

	log.Printf("[ParkHandler] toggling park %d to status %d", id, req.Status)
	if err := h.service.ToggleStatus(id, req.Status); err != nil {
		log.Printf("[ParkHandler] ToggleStatus failed: %v", err)
		response.ServerError(c, "failed to toggle status")
		return
	}

	log.Printf("[ParkHandler] ToggleStatus succeeded: park %d now status %d", id, req.Status)
	response.OK(c, nil)
}
