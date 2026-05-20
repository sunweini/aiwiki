package middleware

import (
	"log"
	"sync"

	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var permCache sync.Map
var rbacDB *gorm.DB

// InitRBAC 初始化 RBAC 中间件的数据库连接
func InitRBAC(db *gorm.DB) { rbacDB = db }

// RequirePermission 权限校验中间件：检查当前角色是否拥有指定模块和操作的权限，使用 sync.Map 缓存结果
func RequirePermission(module, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetString("role")
		if role == "" {
			log.Printf("[RBAC] RequirePermission failed: empty role, path: %s, module: %s, action: %s", c.Request.URL.Path, module, action)
			response.Forbidden(c)
			c.Abort()
			return
		}
		if role == "ADMIN_PLATFORM" {
			c.Next()
			return
		}

		key := role + ":" + module + ":" + action
		if allowed, ok := permCache.Load(key); ok {
			if allowed.(bool) { c.Next() } else {
				log.Printf("[RBAC] RequirePermission denied (cached): role: %s, module: %s, action: %s", role, module, action)
				response.Forbidden(c); c.Abort()
			}
			return
		}

		var count int64
		rbacDB.Table("permission").
			Joins("INNER JOIN role_permission ON role_permission.permission_id = permission.id").
			Joins("INNER JOIN role ON role.id = role_permission.role_id").
			Where("role.code = ? AND permission.module = ? AND permission.action = ?", role, module, action).
			Count(&count)

		allowed := count > 0
		permCache.Store(key, allowed)
		if !allowed {
			log.Printf("[RBAC] RequirePermission denied: role: %s, module: %s, action: %s, path: %s", role, module, action, c.Request.URL.Path)
			response.Forbidden(c); c.Abort(); return
		}
		log.Printf("[RBAC] RequirePermission granted: role: %s, module: %s, action: %s, path: %s", role, module, action, c.Request.URL.Path)
		c.Next()
	}
}
