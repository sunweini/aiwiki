package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMenuVisibilityPlatform(t *testing.T) {
	assert.True(t, MenuVisibility["platform"]["overview"])
	assert.True(t, MenuVisibility["platform"]["parks"])
	assert.True(t, MenuVisibility["platform"]["meituan"])
}

func TestMenuVisibilityPark(t *testing.T) {
	assert.True(t, MenuVisibility["park"]["shops"])
	assert.True(t, MenuVisibility["park"]["gates"])
	assert.False(t, MenuVisibility["park"]["overview"])
}

func TestMenuVisibilityShop(t *testing.T) {
	assert.True(t, MenuVisibility["shop"]["consumption"])
	assert.True(t, MenuVisibility["shop"]["withdraw"])
	assert.False(t, MenuVisibility["shop"]["parks"])
}

func TestMenuVisibilityAllViewsExist(t *testing.T) {
	assert.NotNil(t, MenuVisibility["platform"])
	assert.NotNil(t, MenuVisibility["park"])
	assert.NotNil(t, MenuVisibility["shop"])
}

func TestMenuItemStructure(t *testing.T) {
	item := MenuItem{ID: "test", Label: "测试", Page: "test-page"}
	assert.Equal(t, "test", item.ID)
	assert.Equal(t, "测试", item.Label)
}
