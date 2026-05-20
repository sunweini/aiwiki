package meituan

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"time"
)

type Token struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    int    `json:"expiresIn"`
}

// GetToken 用授权码换取美团门店 appAuthToken
func (c *Client) GetToken(ctx context.Context, businessID int, code string) (*Token, error) {
	biz := map[string]string{"code": code}
	body, err := c.DoWithPath("/general/auth/token", businessID, "", biz)
	if err != nil {
		return nil, fmt.Errorf("meituan token request failed: %w", err)
	}

	var resp struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			AccessToken  string `json:"accessToken"`
			RefreshToken string `json:"refreshToken"`
			ExpiresIn    int    `json:"expiresIn"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("meituan token response parse failed: %w", err)
	}
	if resp.Code != 0 {
		return nil, &APIError{Code: resp.Code, Message: resp.Message}
	}
	return &Token{
		AccessToken:  resp.Data.AccessToken,
		RefreshToken: resp.Data.RefreshToken,
		ExpiresIn:    resp.Data.ExpiresIn,
	}, nil
}

// RefreshToken 刷新美团门店 appAuthToken
func (c *Client) RefreshToken(ctx context.Context, businessID int, refreshToken string) (*Token, error) {
	biz := map[string]string{"refreshToken": refreshToken}
	body, err := c.DoWithPath("/general/auth/refreshToken", businessID, "", biz)
	if err != nil {
		return nil, fmt.Errorf("meituan refresh token request failed: %w", err)
	}

	var resp struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			AccessToken  string `json:"accessToken"`
			RefreshToken string `json:"refreshToken"`
			ExpiresIn    int    `json:"expiresIn"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("meituan refresh token response parse failed: %w", err)
	}
	if resp.Code != 0 {
		return nil, &APIError{Code: resp.Code, Message: resp.Message}
	}
	return &Token{
		AccessToken:  resp.Data.AccessToken,
		RefreshToken: resp.Data.RefreshToken,
		ExpiresIn:    resp.Data.ExpiresIn,
	}, nil
}

func (c *Client) BuildAuthURL(businessID int, redirectURL string) string {
	params := url.Values{}
	params.Set("developerId", fmt.Sprintf("%d", c.DeveloperID))
	params.Set("businessId", fmt.Sprintf("%d", businessID))
	params.Set("timestamp", fmt.Sprintf("%d", time.Now().Unix()))
	params.Set("redirectUrl", redirectURL)

	signParams := map[string]string{
		"developerId": params.Get("developerId"),
		"businessId":  params.Get("businessId"),
		"timestamp":   params.Get("timestamp"),
	}
	params.Set("sign", c.Sign(signParams))

	return "https://open-erp.meituan.com/general/auth?" + params.Encode()
}
