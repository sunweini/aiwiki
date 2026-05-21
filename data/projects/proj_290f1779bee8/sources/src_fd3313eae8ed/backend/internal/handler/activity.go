package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// ActivityHandler 活动管理处理器，处理活动的增删改查和统计
type ActivityHandler struct {
	service *service.ActivityService
}

func NewActivityHandler(svc *service.ActivityService) *ActivityHandler {
	return &ActivityHandler{service: svc}
}

// List 获取活动列表，支持按状态和类型筛选及分页
func (h *ActivityHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ActivityHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 status 和 type 过滤
	filters := make(map[string]interface{})
	if status := c.Query("status"); status != "" {
		s, _ := strconv.Atoi(status)
		filters["status"] = int8(s)
	}
	if actType := c.Query("type"); actType != "" {
		filters["type"] = actType
	}

	log.Printf("[ActivityHandler] querying activities with filters: %v", filters)
	activities, total, err := h.service.List(page, pageSize, filters)
	if err != nil {
		log.Printf("[ActivityHandler] List failed: %v", err)
		response.ServerError(c, "failed to list activities")
		return
	}

	log.Printf("[ActivityHandler] List succeeded: %d records returned", len(activities))
	response.OKPage(c, activities, total, page, pageSize)
}

// Create 创建新活动，接收活动模型并持久化到数据库
func (h *ActivityHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[ActivityHandler] Create called by user %d", empID)

	var act model.Activity
	if err := c.ShouldBindJSON(&act); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[ActivityHandler] creating activity: %s", act.Title)
	if err := h.service.Create(&act); err != nil {
		log.Printf("[ActivityHandler] Create failed: %v", err)
		response.Error(c, 409, err.Error())
		return
	}

	log.Printf("[ActivityHandler] Create succeeded: activity %d", act.ID)
	response.OK(c, act)
}

// Update 更新活动信息，根据ID部分更新活动字段
func (h *ActivityHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ActivityHandler] Update called by user %d for activity %d", empID, id)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[ActivityHandler] updating activity %d with fields: %v", id, updates)
	if err := h.service.Update(id, updates); err != nil {
		log.Printf("[ActivityHandler] Update failed: %v", err)
		response.NotFound(c, "activity not found")
		return
	}

	log.Printf("[ActivityHandler] Update succeeded: activity %d", id)
	response.OK(c, nil)
}

// Delete 删除指定活动，根据ID软删除或硬删除活动记录
func (h *ActivityHandler) Delete(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ActivityHandler] Delete called by user %d for activity %d", empID, id)

	if err := h.service.Delete(id); err != nil {
		log.Printf("[ActivityHandler] Delete failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[ActivityHandler] Delete succeeded: activity %d", id)
	response.OK(c, nil)
}

// GetStats 获取活动统计数据，返回该活动的参与人数、收入等统计信息
func (h *ActivityHandler) GetStats(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[ActivityHandler] GetStats called by user %d for activity %d", empID, id)

	stats, err := h.service.GetStats(id)
	if err != nil {
		log.Printf("[ActivityHandler] GetStats failed: %v", err)
		response.NotFound(c, "activity not found")
		return
	}

	log.Printf("[ActivityHandler] GetStats succeeded for activity %d", id)
	response.OK(c, stats)
}
