package meituan

import (
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

type Client struct {
	DeveloperID int64
	SignKey     string
	BaseURL     string
	httpClient  *http.Client
}

func NewClient(developerID int64, signKey, baseURL string) *Client {
	return &Client{
		DeveloperID: developerID,
		SignKey:     signKey,
		BaseURL:     baseURL,
		httpClient:  &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) Sign(params map[string]string) string {
	// 1. Exclude sign and empty values
	keys := make([]string, 0, len(params))
	for k, v := range params {
		if v != "" && k != "sign" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	// 2. Join: signKey + key1value1key2value2...
	var signStr strings.Builder
	signStr.WriteString(c.SignKey)
	for _, k := range keys {
		signStr.WriteString(k)
		signStr.WriteString(params[k])
	}

	// 3. SHA1
	hash := sha1.Sum([]byte(signStr.String()))
	return fmt.Sprintf("%x", hash)
}

func (c *Client) Do(businessID int, appAuthToken string, biz interface{}) ([]byte, error) {
	bizJSON, _ := json.Marshal(biz)

	params := map[string]string{
		"developerId":  fmt.Sprintf("%d", c.DeveloperID),
		"timestamp":    fmt.Sprintf("%d", time.Now().Unix()),
		"charset":      "utf-8",
		"version":      "2",
		"businessId":   fmt.Sprintf("%d", businessID),
		"appAuthToken": appAuthToken,
		"biz":          url.QueryEscape(string(bizJSON)),
	}

	params["sign"] = c.Sign(params)

	// Build form data
	formData := url.Values{}
	for k, v := range params {
		formData.Set(k, v)
	}

	resp, err := c.httpClient.PostForm(c.BaseURL, formData)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("meituan API error: %d %s", resp.StatusCode, string(body))
	}

	return body, nil
}

func (c *Client) DoWithPath(path string, businessID int, appAuthToken string, biz interface{}) ([]byte, error) {
	bizJSON, _ := json.Marshal(biz)

	params := map[string]string{
		"developerId":  fmt.Sprintf("%d", c.DeveloperID),
		"timestamp":    fmt.Sprintf("%d", time.Now().Unix()),
		"charset":      "utf-8",
		"version":      "2",
		"businessId":   fmt.Sprintf("%d", businessID),
		"appAuthToken": appAuthToken,
		"biz":          url.QueryEscape(string(bizJSON)),
	}

	params["sign"] = c.Sign(params)

	formData := url.Values{}
	for k, v := range params {
		formData.Set(k, v)
	}

	fullURL := c.BaseURL + path
	resp, err := c.httpClient.PostForm(fullURL, formData)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("meituan API error: %d %s", resp.StatusCode, string(body))
	}

	return body, nil
}
