package douyin

import (
	"context"
	"encoding/json"
)

type OrderQueryResponse struct {
	Data  *OrderInfo `json:"data"`
	Extra *ExtraInfo `json:"extra"`
}

type OrderInfo struct {
	OrderID     string `json:"order_id"`
	OrderStatus int    `json:"order_status"`
	Amount      int64  `json:"amount"`
	ProductName string `json:"product_name"`
}

func (c *Client) QueryOrder(ctx context.Context, accessToken, orderID string) (*OrderInfo, error) {
	body, err := c.Get(ctx, accessToken, "/goodlife/v1/order/query/?order_id="+orderID)
	if err != nil {
		return nil, err
	}

	var resp OrderQueryResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	if resp.Extra != nil && resp.Extra.ErrorCode != 0 {
		return nil, &DouyinError{Code: resp.Extra.ErrorCode, Message: resp.Extra.Message}
	}
	return resp.Data, nil
}
