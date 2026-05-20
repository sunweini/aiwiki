package meituan

import (
	"encoding/json"
	"fmt"
)

type PrepareRequest struct {
	CouponCode string `json:"couponCode"`
}

type PrepareResponse struct {
	Code    int        `json:"code"`
	Message string     `json:"message"`
	Data    *CouponInfo `json:"data"`
}

type CouponInfo struct {
	CouponCode  string  `json:"couponCode"`
	ProductName string  `json:"productName"`
	Status      int     `json:"status"`
	Price       float64 `json:"price"`
}

type ConsumeRequest struct {
	Codes      []string `json:"codes"`
	Idempotent string   `json:"idempotent"`
}

type ConsumeResponse struct {
	Code    int             `json:"code"`
	Message string          `json:"message"`
	Data    *ConsumeResult  `json:"data"`
}

type ConsumeResult struct {
	Success bool   `json:"success"`
	DealID  string `json:"dealId"`
	Message string `json:"message"`
}

// BusinessID 58 = 到店餐饮核销（新）
const BusinessIDVerify = 58

func (c *Client) PrepareCoupon(appAuthToken string, req *PrepareRequest) (*CouponInfo, error) {
	body, err := c.DoWithPath("/tuangou/coupon/prepare", BusinessIDVerify, appAuthToken, req)
	if err != nil {
		return nil, err
	}

	var resp PrepareResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	if resp.Code != 0 {
		return nil, &APIError{Code: resp.Code, Message: resp.Message}
	}
	return resp.Data, nil
}

func (c *Client) ConsumeCoupon(appAuthToken string, req *ConsumeRequest) (*ConsumeResult, error) {
	body, err := c.DoWithPath("/tuangouself/coupon/consume", BusinessIDVerify, appAuthToken, req)
	if err != nil {
		return nil, err
	}

	var resp ConsumeResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	if resp.Code != 0 {
		return nil, &APIError{Code: resp.Code, Message: resp.Message}
	}
	return resp.Data, nil
}

func (c *Client) ReverseConsume(appAuthToken string, receiptCode, dealID string) error {
	biz := map[string]string{
		"receiptCode": receiptCode,
		"dealId":      dealID,
	}
	body, err := c.DoWithPath("/ddzh/tuangou/receipt/reverseconsume", BusinessIDVerify, appAuthToken, biz)
	if err != nil {
		return err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return err
	}

	if code, ok := resp["code"].(float64); ok && code != 0 {
		msg, _ := resp["message"].(string)
		return &APIError{Code: int(code), Message: msg}
	}
	return nil
}

type APIError struct {
	Code    int
	Message string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("meituan API error: code=%d, message=%s", e.Code, e.Message)
}
