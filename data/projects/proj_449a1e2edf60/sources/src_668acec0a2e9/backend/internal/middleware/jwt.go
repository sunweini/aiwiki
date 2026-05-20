package middleware

import (
	"fmt"
	"log"
	"strings"
	"time"

	"yfsc-platform-v2/backend/internal/config"
	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	EmployeeID int64  `json:"employee_id"`
	Username   string `json:"username"`
	Role       string `json:"role"`
	TokenType  string `json:"type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

// JWTAuth JWT 认证中间件：从 Authorization header 提取 token，验证签名、有效期和类型
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			log.Printf("[JWT] JWTAuth failed: missing token, path: %s", c.Request.URL.Path)
			response.Unauthorized(c, "missing token")
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
			return []byte(config.C.JWT.Secret), nil
		})

		if err != nil || !token.Valid {
			log.Printf("[JWT] JWTAuth failed: invalid token, path: %s, error: %v", c.Request.URL.Path, err)
			response.Unauthorized(c, "invalid token")
			c.Abort()
			return
		}

		claims, ok := token.Claims.(*Claims)
		if !ok {
			log.Printf("[JWT] JWTAuth failed: invalid claims, path: %s", c.Request.URL.Path)
			response.Unauthorized(c, "invalid claims")
			c.Abort()
			return
		}

		if claims.TokenType != "access" {
			log.Printf("[JWT] JWTAuth failed: refresh token used in access endpoint, path: %s", c.Request.URL.Path)
			response.Unauthorized(c, "refresh token not allowed here")
			c.Abort()
			return
		}

		log.Printf("[JWT] JWTAuth passed: employeeID: %d, role: %s, path: %s", claims.EmployeeID, claims.Role, c.Request.URL.Path)
		c.Set("employee_id", claims.EmployeeID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// GenerateToken 为员工生成 access token 和 refresh token 对
func GenerateToken(emp *model.Employee) (string, string, error) {
	log.Printf("[JWT] GenerateToken called for employee: %s, role: %s", emp.Username, emp.Role)
	now := time.Now()

	claims := Claims{
		EmployeeID: emp.ID,
		Username:   emp.Username,
		Role:       emp.Role,
		TokenType:  "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(config.C.JWT.ExpireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	refreshClaims := Claims{
		EmployeeID: emp.ID,
		TokenType:  "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Duration(config.C.JWT.RefreshExpireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(config.C.JWT.Secret))
	if err != nil {
		log.Printf("[JWT] GenerateToken failed: access token signing error %v", err)
		return "", "", err
	}

	refreshSecret := config.C.JWT.Secret + "_refresh"
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString([]byte(refreshSecret))
	if err != nil {
		log.Printf("[JWT] GenerateToken failed: refresh token signing error %v", err)
		return "", "", err
	}

	log.Printf("[JWT] GenerateToken succeeded: employee %s", emp.Username)
	return accessToken, refreshStr, nil
}

// ParseToken 解析并验证 access token，返回 Claims（用于 refresh 等场景）
func ParseToken(tokenStr string) (*Claims, error) {
	log.Printf("[JWT] ParseToken called")
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(config.C.JWT.Secret), nil
	})
	if err != nil {
		log.Printf("[JWT] ParseToken failed: %v", err)
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok {
		log.Printf("[JWT] ParseToken failed: invalid claims type")
		return nil, fmt.Errorf("invalid claims type")
	}
	log.Printf("[JWT] ParseToken succeeded: employeeID: %d, type: %s", claims.EmployeeID, claims.TokenType)
	return claims, nil
}
