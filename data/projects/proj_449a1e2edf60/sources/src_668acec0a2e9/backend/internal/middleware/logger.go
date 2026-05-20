package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger 请求日志中间件：记录每个请求的方法、路径、状态码和响应耗时
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		if query != "" {
			path = path + "?" + query
		}

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		log.Printf("[Logger] [%d] %s %s %v", status, c.Request.Method, path, latency)
	}
}
