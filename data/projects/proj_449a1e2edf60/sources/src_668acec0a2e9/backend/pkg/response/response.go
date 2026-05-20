package response

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code      int         `json:"code"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp int64       `json:"timestamp"`
}

type PageData struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:      0,
		Message:   "success",
		Data:      data,
		Timestamp: time.Now().Unix(),
	})
}

func OKPage(c *gin.Context, items interface{}, total int64, page, pageSize int) {
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data: PageData{
			Items:      items,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
		},
		Timestamp: time.Now().Unix(),
	})
}

func Error(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, Response{
		Code:      code,
		Message:   message,
		Timestamp: time.Now().Unix(),
	})
}

func ServerError(c *gin.Context, msg string) {
	Error(c, CodeServerError, msg)
}

func Unauthorized(c *gin.Context, msg ...string) {
	m := "unauthorized"
	if len(msg) > 0 {
		m = msg[0]
	}
	c.JSON(http.StatusUnauthorized, Response{
		Code:      CodeUnauthorized,
		Message:   m,
		Timestamp: time.Now().Unix(),
	})
}

func Forbidden(c *gin.Context) {
	Error(c, CodeForbidden, "forbidden")
}

func NotFound(c *gin.Context, msg ...string) {
	m := "not found"
	if len(msg) > 0 {
		m = msg[0]
	}
	Error(c, CodeNotFound, m)
}
