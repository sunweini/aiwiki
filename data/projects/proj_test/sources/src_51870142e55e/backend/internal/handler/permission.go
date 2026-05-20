package handler

import (
	"log"
	"strconv"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// PermissionHandler 权限管理处理器，处理权限列表查询和角色权限分配
type PermissionHandler struct {
	rbacService *service.RBACService
}

func NewPermissionHandler(rbacService *service.RBACService) *PermissionHandler {
	return &PermissionHandler{rbacService: rbacService}
}

// ListAllPermissions 获取所有权限列表，返回完整的权限定义
func (h *PermissionHandler) ListAllPermissions(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[PermissionHandler] ListAllPermissions called by user %d", empID)

	perms, err := h.rbacService.GetAllPermissions()
	if err != nil {
		log.Printf("[PermissionHandler] ListAllPermissions failed: %v", err)
		response.ServerError(c, "failed to list permissions")
		return
	}

	log.Printf("[PermissionHandler] ListAllPermissions succeeded: %d permissions returned", len(perms))
	response.OK(c, perms)
}

// GetRolePermissions 获取指定角色已分配的权限ID列表
func (h *PermissionHandler) GetRolePermissions(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	roleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[PermissionHandler] GetRolePermissions called by user %d for role %d", empID, roleID)

	permIDs, err := h.rbacService.GetRolePermissions(roleID)
	if err != nil {
		log.Printf("[PermissionHandler] GetRolePermissions failed: %v", err)
		response.ServerError(c, "failed to get role permissions")
		return
	}

	log.Printf("[PermissionHandler] GetRolePermissions succeeded: %d permissions for role %d", len(permIDs), roleID)
	response.OK(c, permIDs)
}

// UpdateRolePermissions 更新角色权限分配，用新的权限ID列表替换角色的全部权限
func (h *PermissionHandler) UpdateRolePermissions(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	roleID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	log.Printf("[PermissionHandler] UpdateRolePermissions called by user %d for role %d", empID, roleID)

	var req struct {
		PermissionIDs []int64 `json:"permission_ids" binding:"required"` // 权限ID列表，必填
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, 400, "invalid request")
		return
	}

	log.Printf("[PermissionHandler] updating role %d with %d permissions", roleID, len(req.PermissionIDs))
	if err := h.rbacService.UpdateRolePermissions(roleID, req.PermissionIDs); err != nil {
		log.Printf("[PermissionHandler] UpdateRolePermissions failed: %v", err)
		response.ServerError(c, "failed to update permissions")
		return
	}

	log.Printf("[PermissionHandler] UpdateRolePermissions succeeded: role %d now has %d permissions", roleID, len(req.PermissionIDs))
	response.OK(c, nil)
}
