package middleware

import (
	"log"

	"github.com/gin-gonic/gin"
)

// CORSOrigin is the allowed origin. In production, set via env/config.
var CORSOrigin = "*"

// CORS 跨域资源共享中间件：设置允许的源、方法和请求头，处理预检请求
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Printf("[CORS] Handling %s request from %s", c.Request.Method, c.Request.Referer())
		c.Header("Access-Control-Allow-Origin", CORSOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
