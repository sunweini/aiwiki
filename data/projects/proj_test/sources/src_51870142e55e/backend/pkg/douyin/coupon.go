package douyin

import (
	"context"
	"encoding/json"
	"fmt"
)

type PrepareRequest struct {
	CertificateCode string `json:"certificate_code"`
}

type PrepareResponse struct {
	Data  *CertificateInfo `json:"data"`
	Extra *ExtraInfo       `json:"extra"`
}

type CertificateInfo struct {
	CertificateCode string `json:"certificate_code"`
	ProductName     string `json:"product_name"`
	Status          int    `json:"status"`
	Amount          int64  `json:"amount"` // 分
}

type ExtraInfo struct {
	ErrorCode int    `json:"error_code"`
	Message   string `json:"description"`
}

type VerifyRequest struct {
	CertificateCode string `json:"certificate_code"`
	VerifyType      int    `json:"verify_type"`
	VerifyTime      int64  `json:"verify_time"`
	VerifyID        string `json:"verify_id"`
	POIID           string `json:"poi_id"`
}

type VerifyResponse struct {
	Data  *VerifyResult `json:"data"`
	Extra *ExtraInfo    `json:"extra"`
}

type VerifyResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func (c *Client) PrepareCertificate(ctx context.Context, accessToken string, req *PrepareRequest) (*CertificateInfo, error) {
	body, err := c.Do(ctx, accessToken, "/goodlife/v1/fulfilment/certificate/prepare/", req)
	if err != nil {
		return nil, err
	}

	var resp PrepareResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	if resp.Extra != nil && resp.Extra.ErrorCode != 0 {
		return nil, &DouyinError{Code: resp.Extra.ErrorCode, Message: resp.Extra.Message}
	}
	return resp.Data, nil
}

func (c *Client) VerifyCertificate(ctx context.Context, accessToken string, req *VerifyRequest) (*VerifyResult, error) {
	body, err := c.Do(ctx, accessToken, "/goodlife/v1/fulfilment/certificate/verify/", req)
	if err != nil {
		return nil, err
	}

	var resp VerifyResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}

	if resp.Extra != nil && resp.Extra.ErrorCode != 0 {
		return nil, &DouyinError{Code: resp.Extra.ErrorCode, Message: resp.Extra.Message}
	}
	return resp.Data, nil
}

// 三方券码直接 verify（无需 prepare）
func (c *Client) VerifyThirdPartyCoupon(ctx context.Context, accessToken string, req *VerifyRequest) (*VerifyResult, error) {
	return c.VerifyCertificate(ctx, accessToken, req)
}

func (c *Client) ReverseVerify(ctx context.Context, accessToken, certificateCode string) error {
	// Douyin reverse verify endpoint
	body, err := c.Do(ctx, accessToken, "/goodlife/v1/fulfilment/certificate/reverse/", map[string]string{
		"certificate_code": certificateCode,
	})
	if err != nil {
		return err
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(body, &resp); err != nil {
		return err
	}

	if extra, ok := resp["extra"].(map[string]interface{}); ok {
		if code, ok := extra["error_code"].(float64); ok && code != 0 {
			msg, _ := extra["description"].(string)
			return &DouyinError{Code: int(code), Message: msg}
		}
	}
	return nil
}

type DouyinError struct {
	Code    int
	Message string
}

func (e *DouyinError) Error() string {
	return fmt.Sprintf("douyin API error: code=%d, message=%s", e.Code, e.Message)
}
