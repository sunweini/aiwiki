package handler

import (
	"log"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

// AuthHandler 认证处理器，处理用户登录、登出和令牌刷新
type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// LoginRequest 登录请求参数，包含用户名和密码
type LoginRequest struct {
	Username string `json:"username" binding:"required"` // 用户名，必填
	Password string `json:"password" binding:"required"` // 密码，必填
}

// LoginResponse 登录响应，包含访问令牌、刷新令牌和员工信息
type LoginResponse struct {
	AccessToken  string   `json:"access_token"`  // JWT 访问令牌
	RefreshToken string   `json:"refresh_token"` // JWT 刷新令牌
	Employee     *EmpInfo `json:"employee"`      // 当前登录员工信息
}

// EmpInfo 员工信息结构，包含基本身份和所属组织
type EmpInfo struct {
	ID       int64  `json:"id"`        // 员工ID
	Username string `json:"username"`  // 用户名
	RealName string `json:"real_name"` // 真实姓名
	Role     string `json:"role"`      // 角色代码
	ParkID   *int64 `json:"park_id"`   // 所属园区ID（可选）
	ShopID   *int64 `json:"shop_id"`   // 所属店铺ID（可选）
}

// Login 用户登录，验证用户名密码并返回JWT令牌和员工信息
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, response.CodeUnauthorized, "invalid request")
		return
	}

	log.Printf("[AuthHandler] Login attempt for user: %s", req.Username)
	accessToken, refreshToken, emp, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		log.Printf("[AuthHandler] Login failed for user %s: %v", req.Username, err)
		response.Error(c, response.CodePasswordWrong, err.Error())
		return
	}

	log.Printf("[AuthHandler] Login succeeded for user %s, employee ID: %d", req.Username, emp.ID)
	response.OK(c, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Employee: &EmpInfo{
			ID:       emp.ID,
			Username: emp.Username,
			RealName: emp.RealName,
			Role:     emp.Role,
			ParkID:   emp.ParkID,
			ShopID:   emp.ShopID,
		},
	})
}

// Refresh 刷新访问令牌（暂未实现）
func (h *AuthHandler) Refresh(c *gin.Context) {
	log.Printf("[AuthHandler] Refresh called (not implemented)")
	response.ServerError(c, "not implemented")
}

// Logout 用户登出，清理会话信息
func (h *AuthHandler) Logout(c *gin.Context) {
	empID := c.GetInt64("employee_id")
	log.Printf("[AuthHandler] Logout called by user %d", empID)
	response.OK(c, nil)
}
