package alipay

import (
	"context"
	"encoding/json"
)

type TransferRequest struct {
	OutBizNo    string    `json:"out_biz_no"`
	TransAmount string    `json:"trans_amount"`
	ProductCode string    `json:"product_code"`
	BizScene    string    `json:"biz_scene"`
	PayeeInfo   PayeeInfo `json:"payee_info"`
}

type PayeeInfo struct {
	Identity     string `json:"identity"`
	IdentityType string `json:"identity_type"`
}

func (c *Client) Transfer(ctx context.Context, req *TransferRequest) (map[string]interface{}, error) {
	if req.ProductCode == "" {
		req.ProductCode = "TRANS_ACCOUNT_NO_PWD"
	}
	if req.BizScene == "" {
		req.BizScene = "DIRECT_TRANSFER"
	}

	body, err := c.Do(ctx, "alipay.fund.trans.uni.transfer", req)
	if err != nil {
		return nil, err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	return resp, nil
}
