package wechat

import (
	"context"
	"encoding/json"
)

type RefundRequest struct {
	OutTradeNo  string       `json:"out_trade_no,omitempty"`
	OutRefundNo string       `json:"out_refund_no"`
	Reason      string       `json:"reason,omitempty"`
	NotifyURL   string       `json:"notify_url,omitempty"`
	Amount      RefundAmount `json:"amount"`
}

type RefundAmount struct {
	Refund   int    `json:"refund"`
	Total    int    `json:"total"`
	Currency string `json:"currency"`
}

func (c *Client) CreateRefund(ctx context.Context, req *RefundRequest) (map[string]interface{}, error) {
	if req.Amount.Currency == "" {
		req.Amount.Currency = "CNY"
	}
	if req.NotifyURL == "" {
		req.NotifyURL = c.NotifyURL
	}

	respBody, err := c.Do(ctx, "POST", "/v3/refund/domestic/refunds", req)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (c *Client) QueryRefund(ctx context.Context, outRefundNo string) (map[string]interface{}, error) {
	uri := "/v3/refund/domestic/refunds/" + outRefundNo
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
