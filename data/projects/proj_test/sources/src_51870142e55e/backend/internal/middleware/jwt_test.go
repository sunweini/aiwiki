package middleware

import (
	"testing"

	"yfsc-platform-v2/backend/internal/config"
	"yfsc-platform-v2/backend/internal/model"
)

func init() {
	config.C = &config.Config{
		JWT: config.JWTConfig{
			Secret:             "test-secret-key-for-testing",
			ExpireHours:        24,
			RefreshExpireHours: 168,
		},
	}
}

func TestGenerateToken(t *testing.T) {
	emp := &model.Employee{
		BaseModel: model.BaseModel{ID: 1},
		Username:  "testuser",
		Role:      "ADMIN_PLATFORM",
	}

	accessToken, refreshToken, err := GenerateToken(emp)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if accessToken == "" {
		t.Fatal("expected non-empty access token")
	}
	if refreshToken == "" {
		t.Fatal("expected non-empty refresh token")
	}
}

func TestParseToken(t *testing.T) {
	emp := &model.Employee{
		BaseModel: model.BaseModel{ID: 42},
		Username:  "testuser",
		Role:      "PARK_ADMIN",
	}

	accessToken, _, err := GenerateToken(emp)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	claims, err := ParseToken(accessToken)
	if err != nil {
		t.Fatalf("failed to parse token: %v", err)
	}
	if claims.EmployeeID != 42 {
		t.Errorf("expected employee_id 42, got %d", claims.EmployeeID)
	}
	if claims.Username != "testuser" {
		t.Errorf("expected username testuser, got %s", claims.Username)
	}
	if claims.Role != "PARK_ADMIN" {
		t.Errorf("expected role PARK_ADMIN, got %s", claims.Role)
	}
}
