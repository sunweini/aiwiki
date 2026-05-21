package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// SettingsHandler 系统设置处理器，处理小程序配置管理和操作日志查询
type SettingsHandler struct {
	service *service.SettingsService
}

func NewSettingsHandler(svc *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{service: svc}
}

// GetMPConfig 获取指定类型的小程序配置，自动隐藏密钥字段
func (h *SettingsHandler) GetMPConfig(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	configType := c.Param("type")
	log.Printf("[SettingsHandler] GetMPConfig called by user %d for type: %s", empID, configType)

	cfg, err := h.service.GetMPConfig(configType)
	if err != nil {
		log.Printf("[SettingsHandler] GetMPConfig failed: %v", err)
		response.NotFound(c, "config not found")
		return
	}
	// 隐藏密钥字段，防止敏感信息泄露
	cfg.AppSecret = "***"

	log.Printf("[SettingsHandler] GetMPConfig succeeded for type: %s", configType)
	response.OK(c, cfg)
}

// UpdateMPConfig 更新小程序配置，支持动态修改 AppID、密钥等参数
func (h *SettingsHandler) UpdateMPConfig(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	configType := c.Param("type")
	log.Printf("[SettingsHandler] UpdateMPConfig called by user %d for type: %s", empID, configType)

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		response.Error(c, 400, err.Error())
		return
	}

	log.Printf("[SettingsHandler] updating config for type %s with fields: %v", configType, updates)
	if err := h.service.UpdateMPConfig(configType, updates); err != nil {
		log.Printf("[SettingsHandler] UpdateMPConfig failed: %v", err)
		response.ServerError(c, err.Error())
		return
	}

	log.Printf("[SettingsHandler] UpdateMPConfig succeeded for type: %s", configType)
	response.OK(c, nil)
}

// ListLogs 获取系统操作日志列表，支持按模块和状态筛选及分页
func (h *SettingsHandler) ListLogs(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[SettingsHandler] ListLogs called by user %d", empID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	// 构建筛选条件：支持按 module 和 status 过滤
	filters := make(map[string]interface{})
	if module := c.Query("module"); module != "" {
		filters["module"] = module
	}
	if status := c.Query("status"); status != "" {
		s, _ := strconv.Atoi(status)
		filters["status"] = int8(s)
	}

	log.Printf("[SettingsHandler] querying logs with filters: %v", filters)
	logs, total, err := h.service.ListLogs(page, pageSize, filters)
	if err != nil {
		log.Printf("[SettingsHandler] ListLogs failed: %v", err)
		response.ServerError(c, "failed to list logs")
		return
	}

	log.Printf("[SettingsHandler] ListLogs succeeded: %d records returned", len(logs))
	response.OKPage(c, logs, total, page, pageSize)
}
