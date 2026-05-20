package wechat

import (
	"context"
	"encoding/json"
	"fmt"
)

type BillRequest struct {
	BillDate string `json:"bill_date"` // yyyy-MM-DD
	BillType string `json:"bill_type"` // ALL/SUCCESS/REFUND
}

type BillResponse struct {
	DownloadURL string `json:"download_url"`
	HashType    string `json:"hash_type"`
	HashValue   string `json:"hash_value"`
	BillID      string `json:"bill_id"`
}

func (c *Client) ApplyTradeBill(ctx context.Context, req *BillRequest) (*BillResponse, error) {
	uri := fmt.Sprintf("/v3/bill/tradebill?bill_date=%s&bill_type=%s", req.BillDate, req.BillType)
	respBody, err := c.Do(ctx, "GET", uri, nil)
	if err != nil {
		return nil, err
	}

	var result BillResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, err
	}
	return &result, nil
}
