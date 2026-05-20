package response

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setup() (*gin.Context, *httptest.ResponseRecorder) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)
	return c, w
}

func TestOK(t *testing.T) {
	c, w := setup()
	OK(c, map[string]string{"key": "val"})
	assert.Equal(t, http.StatusOK, w.Code)
	var r Response
	json.Unmarshal(w.Body.Bytes(), &r)
	assert.Equal(t, 0, r.Code)
}

func TestOKPage(t *testing.T) {
	c, w := setup()
	OKPage(c, []int{1, 2}, 2, 1, 20)
	var r Response
	json.Unmarshal(w.Body.Bytes(), &r)
	assert.Equal(t, 0, r.Code)
}

func TestError(t *testing.T) {
	c, w := setup()
	Error(c, CodePasswordWrong, "wrong password")
	var r Response
	json.Unmarshal(w.Body.Bytes(), &r)
	assert.Equal(t, CodePasswordWrong, r.Code)
}

func TestUnauthorized(t *testing.T) {
	c, w := setup()
	Unauthorized(c)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestForbidden(t *testing.T) {
	c, w := setup()
	Forbidden(c)
	var r Response
	json.Unmarshal(w.Body.Bytes(), &r)
	assert.Equal(t, CodeForbidden, r.Code)
}

func TestNotFound(t *testing.T) {
	c, w := setup()
	NotFound(c, "user not found")
	var r Response
	json.Unmarshal(w.Body.Bytes(), &r)
	assert.Equal(t, CodeNotFound, r.Code)
}

func TestServerError(t *testing.T) {
	c, w := setup()
	ServerError(c, "boom")
	var r Response
	json.Unmarshal(w.Body.Bytes(), &r)
	assert.Equal(t, CodeServerError, r.Code)
}
