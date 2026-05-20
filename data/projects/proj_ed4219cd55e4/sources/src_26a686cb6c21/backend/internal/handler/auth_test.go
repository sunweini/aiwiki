package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"yfsc-platform-v2/backend/internal/config"
	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/service"
	"yfsc-platform-v2/backend/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type authTestRepo struct{}

func (r *authTestRepo) FindByUsername(u string) (*model.Employee, error) {
	if u == "admin" {
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		return &model.Employee{BaseModel: model.BaseModel{ID: 1}, Username: "admin", PasswordHash: string(hash), Role: "ADMIN_PLATFORM", Status: 1}, nil
	}
	return nil, gorm.ErrRecordNotFound
}
func (r *authTestRepo) FindByID(id int64) (*model.Employee, error) { return nil, nil }
func (r *authTestRepo) List(p, ps int, f map[string]interface{}) ([]model.Employee, int64, error) { return nil, 0, nil }
func (r *authTestRepo) Create(e *model.Employee) error { return nil }
func (r *authTestRepo) Update(id int64, u map[string]interface{}) error { return nil }
func (r *authTestRepo) Delete(id int64) error { return nil }

func init() {
	config.C = &config.Config{
		JWT: config.JWTConfig{Secret: "test-jwt-secret", ExpireHours: 24, RefreshExpireHours: 168},
	}
}

func setupHandler() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	repo := &authTestRepo{}
	svc := service.NewAuthService(repo)
	h := NewAuthHandler(svc)
	r.POST("/auth/login", h.Login)
	r.POST("/auth/refresh", h.Refresh)
	r.POST("/auth/logout", h.Logout)
	return r
}

func TestLoginSuccess(t *testing.T) {
	r := setupHandler()
	body, _ := json.Marshal(map[string]string{"username": "admin", "password": "admin123"})
	req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var resp response.Response
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, 0, resp.Code)
}

func TestLoginWrongPassword(t *testing.T) {
	r := setupHandler()
	body, _ := json.Marshal(map[string]string{"username": "admin", "password": "wrong"})
	req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp response.Response
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NotEqual(t, 0, resp.Code)
}

func TestLoginInvalidJSON(t *testing.T) {
	r := setupHandler()
	req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader([]byte("bad")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp response.Response
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NotEqual(t, 0, resp.Code)
}

func TestLoginNonexistentUser(t *testing.T) {
	r := setupHandler()
	body, _ := json.Marshal(map[string]string{"username": "nobody", "password": "x"})
	req := httptest.NewRequest("POST", "/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp response.Response
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NotEqual(t, 0, resp.Code)
}

func TestLogout(t *testing.T) {
	r := setupHandler()
	req := httptest.NewRequest("POST", "/auth/logout", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}
