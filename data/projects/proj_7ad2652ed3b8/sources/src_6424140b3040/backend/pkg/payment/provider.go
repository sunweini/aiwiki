package payment

import (
	"context"
	"time"
)

const (
	PlatformWechat  = "wechat"
	PlatformAlipay  = "alipay"
	PlatformMeituan = "meituan"
	PlatformDouyin  = "douyin"
)

type CreateOrderRequest struct {
	MerchantOrderNo string            `json:"merchant_order_no"`
	Amount          int64             `json:"amount"` // 分
	Currency        string            `json:"currency"`
	Subject         string            `json:"subject"`
	Body            string            `json:"body,omitempty"`
	NotifyURL       string            `json:"notify_url"`
	OpenID          string            `json:"openid,omitempty"`
	AuthCode        string            `json:"auth_code,omitempty"`
	Extras          map[string]interface{} `json:"extras,omitempty"`
}

type CreateOrderResponse struct {
	MerchantOrderNo string            `json:"merchant_order_no"`
	PlatformOrderNo string            `json:"platform_order_no"`
	PayParams       map[string]string `json:"pay_params"`
	QRCodeURL       string            `json:"qr_code_url,omitempty"`
}

type RefundRequest struct {
	MerchantOrderNo  string `json:"merchant_order_no"`
	MerchantRefundNo string `json:"merchant_refund_no"`
	RefundAmount     int64  `json:"refund_amount"`
	Reason           string `json:"reason,omitempty"`
	NotifyURL        string `json:"notify_url,omitempty"`
}

type RefundResponse struct {
	MerchantRefundNo string `json:"merchant_refund_no"`
	PlatformRefundNo string `json:"platform_refund_no"`
	Status           string `json:"status"`
}

type OrderStatus struct {
	MerchantOrderNo string    `json:"merchant_order_no"`
	PlatformOrderNo string    `json:"platform_order_no"`
	Status          string    `json:"status"`
	TotalAmount     int64     `json:"total_amount"`
	PaidAt          time.Time `json:"paid_at,omitempty"`
}

type RefundStatus struct {
	MerchantRefundNo string `json:"merchant_refund_no"`
	PlatformRefundNo string `json:"platform_refund_no"`
	Status           string `json:"status"`
	RefundAmount     int64  `json:"refund_amount"`
}

type VerifyRequest struct {
	CouponCode string `json:"coupon_code"`
	ShopID     string `json:"shop_id"`
	OperatorID string `json:"operator_id"`
	VerifyID   string `json:"verify_id"`
}

type VerifyResult struct {
	Success     bool   `json:"success"`
	Message     string `json:"message"`
	Amount      int64  `json:"amount"`
	ProductName string `json:"product_name"`
}

type CouponInfo struct {
	CouponCode  string    `json:"coupon_code"`
	ProductName string    `json:"product_name"`
	Status      string    `json:"status"`
	ExpireTime  time.Time `json:"expire_time"`
	Amount      int64     `json:"amount"`
}

type VerifyRecord struct {
	CouponCode string    `json:"coupon_code"`
	Amount     int64     `json:"amount"`
	VerifiedAt time.Time `json:"verified_at"`
	OperatorID string    `json:"operator_id"`
}

type PaymentProvider interface {
	CreateJSAPIOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error)
	CreateNativeOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error)
	QueryOrder(ctx context.Context, merchantOrderNo string) (*OrderStatus, error)
	CloseOrder(ctx context.Context, merchantOrderNo string) error
	Refund(ctx context.Context, req *RefundRequest) (*RefundResponse, error)
	QueryRefund(ctx context.Context, merchantRefundNo string) (*RefundStatus, error)
}

type VerificationProvider interface {
	PrepareCoupon(ctx context.Context, code string) (*CouponInfo, error)
	VerifyCoupon(ctx context.Context, req *VerifyRequest) (*VerifyResult, error)
	ReverseCoupon(ctx context.Context, code string) error
	QueryVerifyHistory(ctx context.Context, shopID string, start, end time.Time) ([]VerifyRecord, error)
}
