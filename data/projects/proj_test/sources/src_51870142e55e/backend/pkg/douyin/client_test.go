package douyin

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewClient(t *testing.T) {
	c := NewClient("client-key", "client-secret", "https://open.douyin.com")
	assert.NotNil(t, c)
	assert.Equal(t, "client-key", c.ClientKey)
	assert.Equal(t, "client-secret", c.ClientSecret)
}

func TestClientTimeout(t *testing.T) {
	c := NewClient("k", "s", "https://open.douyin.com")
	assert.NotNil(t, c.httpClient)
	assert.NotZero(t, c.httpClient.Timeout)
}
