package wechat

import (
	"bytes"
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
	"time"
)

type Client struct {
	MchID          string
	AppID          string
	SerialNo       string
	PrivateKey     *rsa.PrivateKey
	PlatformCert   *x509.Certificate
	BaseURL        string
	NotifyURL      string
	httpClient     *http.Client
}

func NewClient(mchID, appID, serialNo, privateKeyPEM string, baseURL string) (*Client, error) {
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
		MchID:      mchID,
		AppID:      appID,
		SerialNo:   serialNo,
		PrivateKey: rsaKey,
		BaseURL:    baseURL,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}, nil
}

func (c *Client) Sign(method, uri, timestamp, nonce, body string) string {
	signStr := fmt.Sprintf("%s\n%s\n%s\n%s\n%s\n", method, uri, timestamp, nonce, body)
	hashed := sha256.Sum256([]byte(signStr))
	signature, err := c.PrivateKey.Sign(rand.Reader, hashed[:], crypto.SHA256)
	if err != nil {
		return ""
	}
	return base64.StdEncoding.EncodeToString(signature)
}

func (c *Client) Do(ctx context.Context, method, uri string, body interface{}) ([]byte, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, err
		}
	}

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	nonce := fmt.Sprintf("%d", time.Now().UnixNano())

	signature := c.Sign(method, uri, timestamp, nonce, string(bodyBytes))
	authHeader := fmt.Sprintf(
		`WECHATPAY2-SHA256-RSA2048 mchid="%s",nonce_str="%s",timestamp="%s",serial_no="%s",signature="%s"`,
		c.MchID, nonce, timestamp, c.SerialNo, signature,
	)

	req, err := http.NewRequestWithContext(ctx, method, c.BaseURL+uri, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Accept", "application/json")

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
		return nil, fmt.Errorf("wechat API error: %d %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}
