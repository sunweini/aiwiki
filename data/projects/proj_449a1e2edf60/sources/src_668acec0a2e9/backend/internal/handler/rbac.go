package handler

import (
	"log"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// RBACHandler 角色权限管理处理器，处理菜单获取和角色列表查询
type RBACHandler struct {
	service *service.RBACService
}

func NewRBACHandler(svc *service.RBACService) *RBACHandler {
	return &RBACHandler{service: svc}
}

// GetMenu 获取当前用户角色的导航菜单，根据视图和角色代码返回对应菜单树
func (h *RBACHandler) GetMenu(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	view := c.DefaultQuery("view", "platform")
	roleCode := c.GetString("role")
	log.Printf("[RBACHandler] GetMenu called by user %d, view=%s, role=%s", empID, view, roleCode)

	menu := h.service.GetMenu(view, roleCode)

	log.Printf("[RBACHandler] GetMenu succeeded: %d menu items returned", len(menu))
	response.OK(c, menu)
}

// ListRoles 获取所有角色列表，返回角色定义和权限统计
func (h *RBACHandler) ListRoles(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[RBACHandler] ListRoles called by user %d", empID)

	roles, err := h.service.ListRoles()
	if err != nil {
		log.Printf("[RBACHandler] ListRoles failed: %v", err)
		response.ServerError(c, "failed to list roles")
		return
	}

	log.Printf("[RBACHandler] ListRoles succeeded: %d roles returned", len(roles))
	response.OK(c, roles)
}
