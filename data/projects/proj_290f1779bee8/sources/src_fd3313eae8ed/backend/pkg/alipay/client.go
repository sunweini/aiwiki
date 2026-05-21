package alipay

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"
)

type Client struct {
	AppID           string
	AppPrivateKey   *rsa.PrivateKey
	AlipayPublicKey *rsa.PublicKey
	GatewayURL      string
	NotifyURL       string
	httpClient      *http.Client
}

func NewClient(appID, privateKeyPEM, gatewayURL string) (*Client, error) {
	block, _ := pem.Decode([]byte(privateKeyPEM))
	if block == nil {
		return nil, fmt.Errorf("failed to parse private key PEM")
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("failed to parse private key: %w", err)
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("private key is not RSA")
	}

	return &Client{
		AppID:         appID,
		AppPrivateKey: rsaKey,
		GatewayURL:    gatewayURL,
		httpClient:    &http.Client{Timeout: 30 * time.Second},
	}, nil
}

func (c *Client) Sign(params map[string]string) (string, error) {
	// 1. Exclude sign and empty values
	keys := make([]string, 0, len(params))
	for k, v := range params {
		if v != "" && k != "sign" {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)

	// 2. Join key=value&key=value...
	var signStr strings.Builder
	for i, k := range keys {
		if i > 0 {
			signStr.WriteString("&")
		}
		signStr.WriteString(k)
		signStr.WriteString("=")
		signStr.WriteString(params[k])
	}

	// 3. SHA256WithRSA
	hashed := sha256.Sum256([]byte(signStr.String()))
	signature, err := c.AppPrivateKey.Sign(rand.Reader, hashed[:], crypto.SHA256)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(signature), nil
}

func (c *Client) Do(ctx context.Context, method string, bizContent interface{}) ([]byte, error) {
	bizJSON, err := json.Marshal(bizContent)
	if err != nil {
		return nil, err
	}

	params := map[string]string{
		"app_id":      c.AppID,
		"method":      method,
		"format":      "JSON",
		"charset":     "utf-8",
		"sign_type":   "RSA2",
		"timestamp":   time.Now().Format("2006-01-02 15:04:05"),
		"version":     "1.0",
		"biz_content": string(bizJSON),
	}
	if c.NotifyURL != "" {
		params["notify_url"] = c.NotifyURL
	}

	sign, err := c.Sign(params)
	if err != nil {
		return nil, err
	}
	params["sign"] = sign

	// Build form data
	formData := url.Values{}
	for k, v := range params {
		formData.Set(k, v)
	}

	resp, err := c.httpClient.PostForm(c.GatewayURL, formData)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}
