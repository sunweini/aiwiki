package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// GateHandler 闸机设备管理处理器，处理闸机设备的增删改查和通行记录查询
type GateHandler struct {
	service *service.GateService
}

func NewGateHandler(svc *service.GateService) *GateHandler {
	return &GateHandler{service: svc}
}

// List 获取闸机设备列表，支持按园区筛选及分页
func (h *GateHandler) List(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[GateHandler] List called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var parkID *int64
	if pid := c.Query("park_id"); pid != "" {
		p, _ := strconv.ParseInt(pid, 10, 64)
		parkID = &p
	}

	log.Printf("[GateHandler] querying gates with park_id: %v", parkID)
	gates, total, err := h.service.ListGates(page, pageSize, parkID)
	if err != nil {
		log.Printf("[GateHandler] List failed: %v", err)
		response.ServerError(c, "failed to list gates")
		return
	}

	log.Printf("[GateHandler] List succeeded: %d records returned", len(gates))
	response.OKPage(c, gates, total, page, pageSize)
}

// Create 创建新闸机设备，默认状态为启用
func (h *GateHandler) Create(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[GateHandler] Create called by user %d", empID)

	var gate model.GateDevice
	if err := c.ShouldBindJSON(&gate); err != nil {
		response.Error(c, 400, err.Error())
		return
	}
	// 新创建的闸机默认状态为启用(1)
	gate.Status = 1

	log.Printf("[GateHandler] creating gate: %s for park %v", gate.Name, gate.ParkID)
	if err := h.service.CreateGate(&gate); err != nil {
		log.Printf("[GateHandler] Create failed: %v", err)
		response.Error(c, 409, err.Error())
		return
	}

	log.Printf("[GateHandler] Create succeeded: gate %d", gate.ID)
	response.OK(c, gate)
}

// Update 更新闸机设备信息，支持部分字段更新
func (h *GateHandler) Update(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[GateHandler] Update called by user %d for gate %d", empID, id)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[GateHandler] updating gate %d with fields: %v", id, updates)
	if err := h.service.UpdateGate(id, updates); err != nil {
		log.Printf("[GateHandler] Update failed: %v", err)
		response.NotFound(c, "gate not found")
		return
	}

	log.Printf("[GateHandler] Update succeeded: gate %d", id)
	response.OK(c, nil)
}

// Delete 删除指定闸机设备
func (h *GateHandler) Delete(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[GateHandler] Delete called by user %d for gate %d", empID, id)

	if err := h.service.DeleteGate(id); err != nil {
		log.Printf("[GateHandler] Delete failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[GateHandler] Delete succeeded: gate %d", id)
	response.OK(c, nil)
}

// GetEntries 获取指定闸机的通行记录列表，支持分页
func (h *GateHandler) GetEntries(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	gateID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[GateHandler] GetEntries called by user %d for gate %d", empID, gateID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	log.Printf("[GateHandler] querying gate entries for gate %d", gateID)
	entries, total, err := h.service.GetGateEntries(page, pageSize, &gateID)
	if err != nil {
		log.Printf("[GateHandler] GetEntries failed: %v", err)
		response.ServerError(c, "failed to list gate entries")
		return
	}

	log.Printf("[GateHandler] GetEntries succeeded: %d records returned", len(entries))
	response.OKPage(c, entries, total, page, pageSize)
}

// GetFaceRecords 获取人脸录入记录列表，支持按用户ID筛选
func (h *GateHandler) GetFaceRecords(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[GateHandler] GetFaceRecords called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))

	filters := make(map[string]interface{})
	if userID := c.Query("user_id"); userID != "" {
		u, _ := strconv.ParseInt(userID, 10, 64)
		filters["user_id"] = u
	}
	if status := c.Query("status"); status != "" {
		s, _ := strconv.ParseInt(status, 10, 64)
		filters["status"] = s
	}

	log.Printf("[GateHandler] querying face records with filters: %v", filters)
	records, total, err := h.service.ListFaceRecords(page, pageSize, filters)
	if err != nil {
		log.Printf("[GateHandler] GetFaceRecords failed: %v", err)
		response.ServerError(c, "failed to list face records")
		return
	}

	log.Printf("[GateHandler] GetFaceRecords succeeded: %d records returned", len(records))
	response.OKPage(c, records, total, page, pageSize)
}

// DeleteFaceRecord 删除指定人脸记录
func (h *GateHandler) DeleteFaceRecord(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[GateHandler] DeleteFaceRecord called by user %d for record %d", empID, id)

	if err := h.service.DeleteFaceRecord(id); err != nil {
		log.Printf("[GateHandler] DeleteFaceRecord failed: %v", err)
		response.ServerError(c, "failed to delete")
		return
	}

	log.Printf("[GateHandler] DeleteFaceRecord succeeded: record %d", id)
	response.OK(c, nil)
}

// GetEntryRecords 获取全局进出记录列表，支持多维度筛选
func (h *GateHandler) GetEntryRecords(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[GateHandler] GetEntryRecords called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	filters := make(map[string]interface{})
	if gateID := c.Query("gate_id"); gateID != "" {
		g, _ := strconv.ParseInt(gateID, 10, 64)
		filters["gate_id"] = g
	}
	if direction := c.Query("direction"); direction != "" {
		filters["direction"] = direction
	}
	if verifyMethod := c.Query("verify_method"); verifyMethod != "" {
		filters["verify_method"] = verifyMethod
	}

	log.Printf("[GateHandler] querying entry records with filters: %v", filters)
	entries, total, err := h.service.ListEntryRecords(page, pageSize, filters)
	if err != nil {
		log.Printf("[GateHandler] GetEntryRecords failed: %v", err)
		response.ServerError(c, "failed to list entry records")
		return
	}

	log.Printf("[GateHandler] GetEntryRecords succeeded: %d records returned", len(entries))
	response.OKPage(c, entries, total, page, pageSize)
}
