package alipay

import (
	"context"
	"encoding/json"
)

func (c *Client) QueryBillURL(ctx context.Context, billDate string) (string, error) {
	body, err := c.Do(ctx, "alipay.data.dataservice.bill.downloadurl.query", map[string]string{
		"bill_type": "trade",
		"bill_date": billDate,
	})
	if err != nil {
		return "", err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return "", err
	}

	downloadResp, ok := resp["alipay_data_dataservice_bill_downloadurl_query_response"].(map[string]interface{})
	if !ok {
		return "", nil
	}

	if downloadURL, ok := downloadResp["bill_download_url"].(string); ok {
		return downloadURL, nil
	}
	return "", nil
}
