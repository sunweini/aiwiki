package douyin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
)

type Token struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

func (c *Client) GetAccessToken(ctx context.Context, code string) (*Token, error) {
	formData := url.Values{}
	formData.Set("client_key", c.ClientKey)
	formData.Set("client_secret", c.ClientSecret)
	formData.Set("code", code)
	formData.Set("grant_type", "authorization_code")

	resp, err := c.httpClient.PostForm(c.BaseURL+"/oauth/access_token/", formData)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Data  *Token `json:"data"`
		Error string `json:"message"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if result.Data == nil {
		return nil, fmt.Errorf("douyin token error: %s", result.Error)
	}
	return result.Data, nil
}

func (c *Client) RefreshAccessToken(ctx context.Context, refreshToken string) (*Token, error) {
	formData := url.Values{}
	formData.Set("client_key", c.ClientKey)
	formData.Set("client_secret", c.ClientSecret)
	formData.Set("refresh_token", refreshToken)
	formData.Set("grant_type", "refresh_token")

	resp, err := c.httpClient.PostForm(c.BaseURL+"/oauth/refresh_token/", formData)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		Data  *Token `json:"data"`
		Error string `json:"message"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if result.Data == nil {
		return nil, fmt.Errorf("douyin refresh error: %s", result.Error)
	}
	return result.Data, nil
}

func (c *Client) BuildAuthURL(redirectURL string, state string) string {
	params := url.Values{}
	params.Set("client_key", c.ClientKey)
	params.Set("redirect_uri", redirectURL)
	params.Set("response_type", "code")
	params.Set("scope", "user_info")
	if state != "" {
		params.Set("state", state)
	}
	return "https://open.douyin.com/platform/oauth/connect?" + params.Encode()
}
