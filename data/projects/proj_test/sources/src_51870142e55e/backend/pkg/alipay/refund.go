package alipay

import (
	"context"
	"encoding/json"
)

type RefundRequest struct {
	OutTradeNo   string `json:"out_trade_no,omitempty"`
	TradeNo      string `json:"trade_no,omitempty"`
	RefundAmount string `json:"refund_amount"`
	RefundReason string `json:"refund_reason,omitempty"`
	OutRequestNo string `json:"out_request_no"`
}

func (c *Client) TradeRefund(ctx context.Context, req *RefundRequest) (map[string]interface{}, error) {
	body, err := c.Do(ctx, "alipay.trade.refund", req)
	if err != nil {
		return nil, err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	return resp, nil
}
