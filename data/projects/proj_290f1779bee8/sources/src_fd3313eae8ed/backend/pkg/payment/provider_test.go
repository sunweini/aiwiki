package payment

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPlatformConstants(t *testing.T) {
	assert.Equal(t, "wechat", PlatformWechat)
	assert.Equal(t, "alipay", PlatformAlipay)
	assert.Equal(t, "meituan", PlatformMeituan)
	assert.Equal(t, "douyin", PlatformDouyin)
}

func TestNewPaymentProviderUnsupported(t *testing.T) {
	_, err := NewPaymentProvider("unknown", nil)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unsupported")
}

func TestNewVerificationProviderUnsupported(t *testing.T) {
	_, err := NewVerificationProvider("unknown", nil, "")
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unsupported")
}

func TestNewVerificationProviderMeituan(t *testing.T) {
	cfg := &PlatformConfig{}
	cfg.Meituan.DeveloperID = 100
	cfg.Meituan.SignKey = "test-key"
	cfg.Meituan.BusinessID = 200
	p, err := NewVerificationProvider(PlatformMeituan, cfg, "test-token")
	assert.NoError(t, err)
	assert.NotNil(t, p)
}

func TestNewVerificationProviderDouyin(t *testing.T) {
	cfg := &PlatformConfig{}
	cfg.Douyin.ClientKey = "key"
	cfg.Douyin.ClientSecret = "secret"
	p, err := NewVerificationProvider(PlatformDouyin, cfg, "")
	assert.NoError(t, err)
	assert.NotNil(t, p)
}

func TestCreateOrderRequest(t *testing.T) {
	req := &CreateOrderRequest{
		MerchantOrderNo: "ORD-001",
		Amount:          1000,
		Currency:        "CNY",
		Subject:         "test order",
	}
	assert.Equal(t, "ORD-001", req.MerchantOrderNo)
	assert.Equal(t, int64(1000), req.Amount)
}

func TestVerifyRequest(t *testing.T) {
	req := &VerifyRequest{
		CouponCode: "COUPON-123",
		ShopID:     "1",
		OperatorID: "10",
		VerifyID:   "verify-001",
	}
	assert.Equal(t, "COUPON-123", req.CouponCode)
}
