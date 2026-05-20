package meituan

import (
	"encoding/json"
)

type OrderQueryRequest struct {
	OrderID string `json:"orderId"`
}

type OrderInfo struct {
	OrderID  string         `json:"orderId"`
	PayAmount string        `json:"payAmount"`
	Status   int            `json:"status"`
	Products []OrderProduct `json:"products"`
}

type OrderProduct struct {
	PID   string `json:"pid"`
	Num   int    `json:"num"`
	Price string `json:"price"`
}

func (c *Client) QueryOrder(appAuthToken string, orderID string) (*OrderInfo, error) {
	biz := OrderQueryRequest{OrderID: orderID}
	body, err := c.DoWithPath("/api/order/queryById", BusinessIDVerify, appAuthToken, biz)
	if err != nil {
		return nil, err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	orderJSON, _ := json.Marshal(resp)
	var order OrderInfo
	if err := json.Unmarshal(orderJSON, &order); err != nil {
		return nil, err
	}
	return &order, nil
}

func (c *Client) QueryVerifyHistory(appAuthToken string, startDate, endDate string) ([]map[string]interface{}, error) {
	biz := map[string]string{
		"startDate": startDate,
		"endDate":   endDate,
	}
	body, err := c.DoWithPath("/tuangou/coupon/queryListByDate", BusinessIDVerify, appAuthToken, biz)
	if err != nil {
		return nil, err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	return nil, nil // Response format varies; return raw for now
}
