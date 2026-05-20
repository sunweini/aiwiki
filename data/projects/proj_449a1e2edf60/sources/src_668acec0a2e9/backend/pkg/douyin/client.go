package douyin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type Client struct {
	ClientKey    string
	ClientSecret string
	BaseURL      string
	httpClient   *http.Client
}

func NewClient(clientKey, clientSecret, baseURL string) *Client {
	return &Client{
		ClientKey:    clientKey,
		ClientSecret: clientSecret,
		BaseURL:      baseURL,
		httpClient:   &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) Do(ctx context.Context, accessToken, path string, body interface{}) ([]byte, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}

	// Add access_token to query params
	reqURL := c.BaseURL + path + "?access_token=" + url.QueryEscape(accessToken)

	req, err := http.NewRequestWithContext(ctx, "POST", reqURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("douyin API error: %d %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func (c *Client) Get(ctx context.Context, accessToken, path string) ([]byte, error) {
	reqURL := c.BaseURL + path + "?access_token=" + url.QueryEscape(accessToken)

	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}
