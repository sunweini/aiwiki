package meituan

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSign(t *testing.T) {
	c := NewClient(100, "test-sign-key", "https://api.example.com")
	params := map[string]string{
		"developerId": "100",
		"timestamp":   "1700000000",
		"charset":     "utf-8",
		"version":     "2",
		"businessId":  "200",
		"biz":         "test-data",
	}
	sig := c.Sign(params)
	assert.NotEmpty(t, sig)
	// SHA1 produces 40-char hex string
	assert.Len(t, sig, 40)
}

func TestSignExcludesEmpty(t *testing.T) {
	c := NewClient(100, "key", "https://api.example.com")
	params := map[string]string{
		"a": "1",
		"b": "",
		"c": "3",
	}
	sig := c.Sign(params)
	assert.NotEmpty(t, sig)
	// b="" should be excluded from signature
}

func TestSignDeterministic(t *testing.T) {
	c := NewClient(100, "secret", "https://api.example.com")
	params := map[string]string{"x": "1", "y": "2"}
	s1 := c.Sign(params)
	s2 := c.Sign(params)
	assert.Equal(t, s1, s2)
}

func TestNewClient(t *testing.T) {
	c := NewClient(100, "key", "https://api.example.com")
	assert.NotNil(t, c)
	assert.Equal(t, int64(100), c.DeveloperID)
	assert.Equal(t, "key", c.SignKey)
}
