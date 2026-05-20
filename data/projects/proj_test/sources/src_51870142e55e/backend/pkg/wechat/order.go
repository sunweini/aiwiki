package wechat

import (
	"context"
	"encoding/json"
	"fmt"
)

type JSAPIRequest struct {
	AppID       string `json:"appid"`
	MchID       string `json:"mchid"`
	Description string `json:"description"`
	OutTradeNo  string `json:"out_trade_no"`
	NotifyURL   string `json:"notify_url"`
	Amount      Amount `json:"amount"`
	Payer       Payer  `json:"payer"`
}

type Amount struct {
	Total    int    `json:"total"`
	Currency string `json:"currency,omitempty"`
}

type Payer struct {
	OpenID string `json:"openid"`
}

type JSAPIResponse struct {
	PrepayID string `json:"prepay_id"`
}

type NativeRequest struct {
	AppID       string `json:"appid"`
	MchID       string `json:"mchid"`
	Description string `json:"description"`
	OutTradeNo  string `json:"out_trade_no"`
	NotifyURL   string `json:"notify_url"`
	Amount      Amount `json:"amount"`
}

type NativeResponse struct {
	CodeURL string `json:"code_url"`
}

func (c *Client) CreateJSAPIOrder(ctx context.Context, req *JSAPIRequest) (*JSAPIResponse, error) {
	if req.AppID == "" {
		req.AppID = c.AppID
	}
	if req.MchID == "" {
		req.MchID = c.MchID
	}
	if req.NotifyURL == "" {
		req.NotifyURL = c.NotifyURL
	}
	if req.Amount.Currency == "" {
		req.Amount.Currency = "CNY"
	}

	respBody, err := c.Do(ctx, "POST", "/v3/pay/transactions/jsapi", req)
	if err != nil {
		return nil, err
	}

	var result JSAPIResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *Client) CreateNativeOrder(ctx context.Context, req *NativeRequest) (*NativeResponse, error) {
	if req.AppID == "" {
		req.AppID = c.AppID
	}
	if req.MchID == "" {
		req.MchID = c.MchID
	}
	if req.NotifyURL == "" {
		req.NotifyURL = c.NotifyURL
	}
	if req.Amount.Currency == "" {
		req.Amount.Currency = "CNY"
	}

	respBody, err := c.Do(ctx, "POST", "/v3/pay/transactions/native", req)
	if err != nil {
		return nil, err
	}

	var result NativeResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *Client) QueryOrderByOutTradeNo(ctx context.Context, outTradeNo string) (map[string]interface{}, error) {
	uri := fmt.Sprintf("/v3/pay/transactions/out-trade-no/%s?mchid=%s", outTradeNo, c.MchID)
	respBody, err := c.Do(ctx, "GET", uri, nil)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (c *Client) CloseOrder(ctx context.Context, outTradeNo string) error {
	uri := fmt.Sprintf("/v3/pay/transactions/out-trade-no/%s/close", outTradeNo)
	_, err := c.Do(ctx, "POST", uri, map[string]string{"mchid": c.MchID})
	return err
}
