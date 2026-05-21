package handler

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type CallbackHandler struct {
	service *service.CallbackService
}

func NewCallbackHandler(svc *service.CallbackService) *CallbackHandler {
	return &CallbackHandler{service: svc}
}

func (h *CallbackHandler) WechatPay(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Failed to read wechat callback body: %v", err)
		c.JSON(http.StatusOK, gin.H{"code": "FAIL", "message": "bad request"})
		return
	}

	// TODO(production): Verify WeChat APIv3 signature using platform certificate.
	// 1. Get WeChatPay-Signature from header
	// 2. Verify with WeChat platform public key (download from https://api.mch.weixin.qq.com/v3/certificates)
	// 3. Decrypt resource.ciphertext with AEAD_AES_256_GCM (APIv3 key, resource.nonce, resource.associated_data)
	// Without signature verification, this endpoint is vulnerable to forged callbacks.
	var event service.WechatPayEvent
	if err := json.Unmarshal(body, &event); err != nil {
		// Try nested format
		var wrapper struct {
			Resource struct {
				Ciphertext string `json:"ciphertext"`
				Nonce      string `json:"nonce"`
			} `json:"resource"`
		}
		if err2 := json.Unmarshal(body, &wrapper); err2 == nil {
			// In production: decrypt wrapper.Resource.Ciphertext with Nonce
			// For now, respond success to prevent retries
			log.Printf("Wechat callback received (encrypted): %s", string(body))
			c.JSON(http.StatusOK, gin.H{"code": "SUCCESS"})
			return
		}
		log.Printf("Failed to parse wechat callback: %v", err)
		c.JSON(http.StatusOK, gin.H{"code": "FAIL", "message": "bad request"})
		return
	}

	if err := h.service.HandleWechatPay(&event); err != nil {
		log.Printf("Failed to handle wechat callback: %v", err)
		c.JSON(http.StatusOK, gin.H{"code": "FAIL", "message": err.Error()})
		return
	}

	// WeChat expects "SUCCESS" in response body
	c.JSON(http.StatusOK, gin.H{"code": "SUCCESS"})
}

func (h *CallbackHandler) AlipayPay(c *gin.Context) {
	// TODO(production): Verify Alipay RSA2 signature using Alipay public key.
	// 1. Get sign and sign_type from request params
	// 2. Reconstruct sign string, verify with alipay_public_key
	// Without signature verification, this endpoint is vulnerable to forged callbacks.
	outTradeNo := c.PostForm("out_trade_no")
	tradeNo := c.PostForm("trade_no")
	tradeStatus := c.PostForm("trade_status")
	totalAmount := c.PostForm("total_amount")

	event := &service.AlipayNotifyEvent{
		OutTradeNo:  outTradeNo,
		TradeNo:     tradeNo,
		TradeStatus: tradeStatus,
		TotalAmount: totalAmount,
	}

	if err := h.service.HandleAlipayPay(event); err != nil {
		log.Printf("Failed to handle alipay callback: %v", err)
		c.String(http.StatusOK, "fail")
		return
	}

	c.String(http.StatusOK, "success")
}

func (h *CallbackHandler) DouyinSPI(c *gin.Context) {
	// TODO(production): Verify Douyin SPI signature.
	// 1. Extract sign from request body
	// 2. Verify with douyin client_secret HMAC-SHA256
	// Without signature verification, this endpoint is vulnerable to forged callbacks.
	var event service.DouyinSPIEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		log.Printf("Failed to parse douyin SPI: %v", err)
		c.JSON(http.StatusOK, gin.H{"err_no": 1, "err_tips": "bad request"})
		return
	}

	if err := h.service.HandleDouyinSPI(&event); err != nil {
		log.Printf("Failed to handle douyin SPI: %v", err)
		c.JSON(http.StatusOK, gin.H{"err_no": 1, "err_tips": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"err_no": 0, "err_tips": "success"})
}

// Ping is a health check endpoint
func (h *CallbackHandler) Ping(c *gin.Context) {
	response.OK(c, map[string]string{"status": "ok"})
}
