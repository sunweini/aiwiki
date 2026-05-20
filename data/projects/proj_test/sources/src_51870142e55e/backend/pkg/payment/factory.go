package payment

import (
	"context"
	"fmt"
	"time"

	"yfsc-platform-v2/backend/pkg/alipay"
	"yfsc-platform-v2/backend/pkg/douyin"
	"yfsc-platform-v2/backend/pkg/meituan"
	"yfsc-platform-v2/backend/pkg/wechat"
)

type PlatformConfig struct {
	Wechat struct {
		MchID          string `yaml:"mch_id"`
		AppID          string `yaml:"app_id"`
		SerialNo       string `yaml:"serial_no"`
		PrivateKeyPath string `yaml:"private_key_path"`
		NotifyURL      string `yaml:"notify_url"`
	} `yaml:"wechat"`

	Alipay struct {
		AppID          string `yaml:"app_id"`
		PrivateKeyPath string `yaml:"private_key_path"`
		NotifyURL      string `yaml:"notify_url"`
	} `yaml:"alipay"`

	Meituan struct {
		DeveloperID int64  `yaml:"developer_id"`
		SignKey     string `yaml:"sign_key"`
		BusinessID  int    `yaml:"business_id"`
	} `yaml:"meituan"`

	Douyin struct {
		ClientKey    string `yaml:"client_key"`
		ClientSecret string `yaml:"client_secret"`
	} `yaml:"douyin"`
}

type PlatformConfigProvider struct {
	Config *PlatformConfig
}

// WechatProvider implements PaymentProvider
type WechatProvider struct {
	client *wechat.Client
}

func (p *WechatProvider) CreateJSAPIOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error) {
	resp, err := p.client.CreateJSAPIOrder(ctx, &wechat.JSAPIRequest{
		Description: req.Subject,
		OutTradeNo:  req.MerchantOrderNo,
		NotifyURL:   req.NotifyURL,
		Amount:      wechat.Amount{Total: int(req.Amount), Currency: req.Currency},
		Payer:       wechat.Payer{OpenID: req.OpenID},
	})
	if err != nil {
		return nil, err
	}
	return &CreateOrderResponse{
		MerchantOrderNo: req.MerchantOrderNo,
		PayParams:       map[string]string{"prepay_id": resp.PrepayID},
	}, nil
}

func (p *WechatProvider) CreateNativeOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error) {
	resp, err := p.client.CreateNativeOrder(ctx, &wechat.NativeRequest{
		Description: req.Subject,
		OutTradeNo:  req.MerchantOrderNo,
		NotifyURL:   req.NotifyURL,
		Amount:      wechat.Amount{Total: int(req.Amount), Currency: req.Currency},
	})
	if err != nil {
		return nil, err
	}
	return &CreateOrderResponse{
		MerchantOrderNo: req.MerchantOrderNo,
		QRCodeURL:       resp.CodeURL,
	}, nil
}

func (p *WechatProvider) QueryOrder(ctx context.Context, merchantOrderNo string) (*OrderStatus, error) {
	result, err := p.client.QueryOrderByOutTradeNo(ctx, merchantOrderNo)
	if err != nil {
		return nil, err
	}
	status := &OrderStatus{MerchantOrderNo: merchantOrderNo}
	if s, ok := result["trade_state"].(string); ok {
		status.Status = s
	}
	if total, ok := result["amount"].(map[string]interface{}); ok {
		if t, ok := total["total"].(float64); ok {
			status.TotalAmount = int64(t)
		}
	}
	return status, nil
}

func (p *WechatProvider) CloseOrder(ctx context.Context, merchantOrderNo string) error {
	return p.client.CloseOrder(ctx, merchantOrderNo)
}

func (p *WechatProvider) Refund(ctx context.Context, req *RefundRequest) (*RefundResponse, error) {
	result, err := p.client.CreateRefund(ctx, &wechat.RefundRequest{
		OutTradeNo:  req.MerchantOrderNo,
		OutRefundNo: req.MerchantRefundNo,
		Reason:      req.Reason,
		NotifyURL:   req.NotifyURL,
		Amount:      wechat.RefundAmount{Refund: int(req.RefundAmount), Total: int(req.RefundAmount), Currency: "CNY"},
	})
	if err != nil {
		return nil, err
	}
	resp := &RefundResponse{MerchantRefundNo: req.MerchantRefundNo}
	if rid, ok := result["refund_id"].(string); ok {
		resp.PlatformRefundNo = rid
	}
	if s, ok := result["status"].(string); ok {
		resp.Status = s
	}
	return resp, nil
}

func (p *WechatProvider) QueryRefund(ctx context.Context, merchantRefundNo string) (*RefundStatus, error) {
	result, err := p.client.QueryRefund(ctx, merchantRefundNo)
	if err != nil {
		return nil, err
	}
	status := &RefundStatus{MerchantRefundNo: merchantRefundNo}
	if rid, ok := result["refund_id"].(string); ok {
		status.PlatformRefundNo = rid
	}
	if s, ok := result["status"].(string); ok {
		status.Status = s
	}
	return status, nil
}

// AlipayProvider implements PaymentProvider
type AlipayProvider struct {
	client *alipay.Client
}

func (p *AlipayProvider) CreateJSAPIOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error) {
	return nil, fmt.Errorf("alipay JSAPI not supported — use TradePrecreate for QR code")
}

func (p *AlipayProvider) CreateNativeOrder(ctx context.Context, req *CreateOrderRequest) (*CreateOrderResponse, error) {
	resp, err := p.client.TradePrecreate(ctx, &alipay.TradePrecreateRequest{
		OutTradeNo:  req.MerchantOrderNo,
		TotalAmount: fmt.Sprintf("%.2f", float64(req.Amount)/100),
		Subject:     req.Subject,
	})
	if err != nil {
		return nil, err
	}
	return &CreateOrderResponse{
		MerchantOrderNo: req.MerchantOrderNo,
		QRCodeURL:       resp.QRCode,
	}, nil
}

func (p *AlipayProvider) QueryOrder(ctx context.Context, merchantOrderNo string) (*OrderStatus, error) {
	result, err := p.client.TradeQuery(ctx, merchantOrderNo)
	if err != nil {
		return nil, err
	}
	status := &OrderStatus{MerchantOrderNo: merchantOrderNo}
	if tradeStatus, ok := result["trade_status"].(string); ok {
		status.Status = tradeStatus
	}
	if total, ok := result["total_amount"].(string); ok {
		// alipay returns total_amount as string in 元, convert to 分
		var yuan float64
		fmt.Sscanf(total, "%f", &yuan)
		status.TotalAmount = int64(yuan * 100)
	}
	return status, nil
}

func (p *AlipayProvider) CloseOrder(ctx context.Context, merchantOrderNo string) error {
	// TradeClose returns error directly, not (map, error)
	return p.client.TradeClose(ctx, merchantOrderNo)
}

func (p *AlipayProvider) Refund(ctx context.Context, req *RefundRequest) (*RefundResponse, error) {
	result, err := p.client.TradeRefund(ctx, &alipay.RefundRequest{
		OutTradeNo:   req.MerchantOrderNo,
		RefundAmount: fmt.Sprintf("%.2f", float64(req.RefundAmount)/100),
		RefundReason: req.Reason,
		OutRequestNo: req.MerchantRefundNo,
	})
	if err != nil {
		return nil, err
	}
	resp := &RefundResponse{MerchantRefundNo: req.MerchantRefundNo}
	// Alipay wraps refund response under method-specific key
	if refundResp, ok := result["alipay_trade_refund_response"].(map[string]interface{}); ok {
		if tid, ok := refundResp["trade_no"].(string); ok {
			resp.PlatformRefundNo = tid
		}
		if s, ok := refundResp["msg"].(string); ok {
			resp.Status = s
		}
	}
	return resp, nil
}

func (p *AlipayProvider) QueryRefund(ctx context.Context, merchantRefundNo string) (*RefundStatus, error) {
	return nil, fmt.Errorf("alipay query refund not yet implemented")
}

// MeituanProvider implements VerificationProvider
type MeituanProvider struct {
	client       *meituan.Client
	appAuthToken string
}

func (p *MeituanProvider) PrepareCoupon(ctx context.Context, code string) (*CouponInfo, error) {
	info, err := p.client.PrepareCoupon(p.appAuthToken, &meituan.PrepareRequest{CouponCode: code})
	if err != nil {
		return nil, err
	}
	return &CouponInfo{
		CouponCode:  info.CouponCode,
		ProductName: info.ProductName,
		Amount:      int64(info.Price * 100),
	}, nil
}

func (p *MeituanProvider) VerifyCoupon(ctx context.Context, req *VerifyRequest) (*VerifyResult, error) {
	result, err := p.client.ConsumeCoupon(p.appAuthToken, &meituan.ConsumeRequest{
		Codes:      []string{req.CouponCode},
		Idempotent: req.VerifyID,
	})
	if err != nil {
		return nil, err
	}
	return &VerifyResult{
		Success: result.Success,
		Message: result.Message,
	}, nil
}

func (p *MeituanProvider) ReverseCoupon(ctx context.Context, code string) error {
	return p.client.ReverseConsume(p.appAuthToken, code, "")
}

func (p *MeituanProvider) QueryVerifyHistory(ctx context.Context, shopID string, start, end time.Time) ([]VerifyRecord, error) {
	// Returns raw data for now
	return nil, nil
}

// DouyinProvider implements VerificationProvider
type DouyinProvider struct {
	client      *douyin.Client
	accessToken string
}

func (p *DouyinProvider) PrepareCoupon(ctx context.Context, code string) (*CouponInfo, error) {
	info, err := p.client.PrepareCertificate(ctx, p.accessToken, &douyin.PrepareRequest{CertificateCode: code})
	if err != nil {
		return nil, err
	}
	return &CouponInfo{
		CouponCode:  info.CertificateCode,
		ProductName: info.ProductName,
		Amount:      info.Amount,
	}, nil
}

func (p *DouyinProvider) VerifyCoupon(ctx context.Context, req *VerifyRequest) (*VerifyResult, error) {
	result, err := p.client.VerifyCertificate(ctx, p.accessToken, &douyin.VerifyRequest{
		CertificateCode: req.CouponCode,
		VerifyID:        req.VerifyID,
		POIID:           req.ShopID,
		VerifyTime:      time.Now().Unix(),
	})
	if err != nil {
		return nil, err
	}
	return &VerifyResult{
		Success: result.Success,
		Message: result.Message,
	}, nil
}

func (p *DouyinProvider) ReverseCoupon(ctx context.Context, code string) error {
	return p.client.ReverseVerify(ctx, p.accessToken, code)
}

func (p *DouyinProvider) QueryVerifyHistory(ctx context.Context, shopID string, start, end time.Time) ([]VerifyRecord, error) {
	return nil, nil
}

func NewPaymentProvider(platform string, config *PlatformConfig) (PaymentProvider, error) {
	switch platform {
	case PlatformWechat:
		// In production, Load private key from file
		return &WechatProvider{}, nil
	case PlatformAlipay:
		return &AlipayProvider{}, nil
	default:
		return nil, fmt.Errorf("unsupported payment platform: %s", platform)
	}
}

func NewVerificationProvider(platform string, config *PlatformConfig, appAuthToken string) (VerificationProvider, error) {
	switch platform {
	case PlatformMeituan:
		client := meituan.NewClient(config.Meituan.DeveloperID, config.Meituan.SignKey, "https://api-open-cater.meituan.com")
		return &MeituanProvider{client: client, appAuthToken: appAuthToken}, nil
	case PlatformDouyin:
		client := douyin.NewClient(config.Douyin.ClientKey, config.Douyin.ClientSecret, "https://open.douyin.com")
		return &DouyinProvider{client: client, accessToken: ""}, nil
	default:
		return nil, fmt.Errorf("unsupported verification platform: %s", platform)
	}
}
