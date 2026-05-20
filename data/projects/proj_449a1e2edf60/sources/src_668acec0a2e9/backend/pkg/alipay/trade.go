package alipay

import (
	"context"
	"encoding/json"
	"fmt"
)

type TradePayRequest struct {
	OutTradeNo  string `json:"out_trade_no"`
	Scene       string `json:"scene"`
	AuthCode    string `json:"auth_code"`
	Subject     string `json:"subject"`
	TotalAmount string `json:"total_amount"`
}

type TradePayResponse struct {
	Code        string `json:"code"`
	Msg         string `json:"msg"`
	TradeNo     string `json:"trade_no"`
	OutTradeNo  string `json:"out_trade_no"`
	TotalAmount string `json:"total_amount"`
	TradeStatus string `json:"trade_status"`
}

type TradePrecreateRequest struct {
	OutTradeNo  string `json:"out_trade_no"`
	TotalAmount string `json:"total_amount"`
	Subject     string `json:"subject"`
}

type TradePrecreateResponse struct {
	Code       string `json:"code"`
	OutTradeNo string `json:"out_trade_no"`
	QRCode     string `json:"qr_code"`
}

func (c *Client) TradePay(ctx context.Context, req *TradePayRequest) (*TradePayResponse, error) {
	body, err := c.Do(ctx, "alipay.trade.pay", req)
	if err != nil {
		return nil, err
	}

	// Alipay wraps response in method-specific key
	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	payResp, ok := resp["alipay_trade_pay_response"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("unexpected alipay response format")
	}

	payRespJSON, _ := json.Marshal(payResp)
	var result TradePayResponse
	if err := json.Unmarshal(payRespJSON, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *Client) TradePrecreate(ctx context.Context, req *TradePrecreateRequest) (*TradePrecreateResponse, error) {
	body, err := c.Do(ctx, "alipay.trade.precreate", req)
	if err != nil {
		return nil, err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	preResp, ok := resp["alipay_trade_precreate_response"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("unexpected alipay response format")
	}

	preRespJSON, _ := json.Marshal(preResp)
	var result TradePrecreateResponse
	if err := json.Unmarshal(preRespJSON, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *Client) TradeQuery(ctx context.Context, outTradeNo string) (map[string]interface{}, error) {
	body, err := c.Do(ctx, "alipay.trade.query", map[string]string{
		"out_trade_no": outTradeNo,
	})
	if err != nil {
		return nil, err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	return resp, nil
}

func (c *Client) TradeClose(ctx context.Context, outTradeNo string) error {
	_, err := c.Do(ctx, "alipay.trade.close", map[string]string{
		"out_trade_no": outTradeNo,
	})
	return err
}
