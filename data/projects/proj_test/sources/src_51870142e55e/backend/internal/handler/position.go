package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// PositionHandler 职位管理处理器，处理职位的增删改查
type PositionHandler struct {
	service *service.PositionService
}

func NewPositionHandler(svc *service.PositionService) *PositionHandler {
	return &PositionHandler{service: svc}
}

// List 获取职位列表，支持分页
func (h *PositionHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[PositionHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	log.Printf("[PositionHandler] querying positions page=%d page_size=%d", page, pageSize)
	positions, total, err := h.service.List(page, pageSize)
	if err != nil {
		log.Printf("[PositionHandler] List failed: %v", err)
		response.ServerError(c, "failed to list positions")
		return
	}

	log.Printf("[PositionHandler] List succeeded: %d records returned", len(positions))
	response.OKPage(c, positions, total, page, pageSize)
}

// Create 创建新职位，默认状态为启用
func (h *PositionHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[PositionHandler] Create called by user %d", empID)

	var pos model.Position
	if err := c.ShouldBindJSON(&pos); err != nil {
		response.Error(c, 400, err.Error())
		return
	}
	// 新创建的职位默认状态为启用(1)
	pos.Status = 1

	log.Printf("[PositionHandler] creating position: %s", pos.Name)
	if err := h.service.Create(&pos); err != nil {
		log.Printf("[PositionHandler] Create failed: %v", err)
		response.Error(c, 409, err.Error())
		return
	}

	log.Printf("[PositionHandler] Create succeeded: position %d", pos.ID)
	response.OK(c, pos)
}

// Update 更新职位信息，支持部分字段更新
func (h *PositionHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[PositionHandler] Update called by user %d for position %d", empID, id)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[PositionHandler] updating position %d with fields: %v", id, updates)
	if err := h.service.Update(id, updates); err != nil {
		log.Printf("[PositionHandler] Update failed: %v", err)
		response.NotFound(c, "position not found")
		return
	}

	log.Printf("[PositionHandler] Update succeeded: position %d", id)
	response.OK(c, nil)
}

// Delete 删除指定职位
func (h *PositionHandler) Delete(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[PositionHandler] Delete called by user %d for position %d", empID, id)

	if err := h.service.Delete(id); err != nil {
		log.Printf("[PositionHandler] Delete failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[PositionHandler] Delete succeeded: position %d", id)
	response.OK(c, nil)
}
