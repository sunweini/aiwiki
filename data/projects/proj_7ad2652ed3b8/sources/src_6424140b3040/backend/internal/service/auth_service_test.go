package service

import (
	"errors"
	"testing"

	"yfsc-platform-v2/backend/internal/config"
	"yfsc-platform-v2/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
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

type mockAuthRepo struct{}

func (m *mockAuthRepo) FindByUsername(username string) (*model.Employee, error) {
	if username == "testuser" {
		hashed, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
		return &model.Employee{
			BaseModel:    model.BaseModel{ID: 1},
			Username:     "testuser",
			PasswordHash: string(hashed),
			Role:         "ADMIN_PLATFORM",
			Status:       1,
		}, nil
	}
	if username == "disabled" {
		return &model.Employee{
			BaseModel: model.BaseModel{ID: 2},
			Username:  "disabled",
			Status:    0,
		}, nil
	}
	return nil, errors.New("not found")
}

func TestAuthService_Login_Success(t *testing.T) {
	svc := NewAuthService(&mockAuthRepo{})
	accessToken, refreshToken, emp, err := svc.Login("testuser", "password123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if accessToken == "" {
		t.Fatal("expected access token")
	}
	if refreshToken == "" {
		t.Fatal("expected refresh token")
	}
	if emp.Username != "testuser" {
		t.Errorf("expected username testuser, got %s", emp.Username)
	}
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	svc := NewAuthService(&mockAuthRepo{})
	_, _, _, err := svc.Login("testuser", "wrongpassword")
	if err == nil {
		t.Fatal("expected error for wrong password")
	}
	if err.Error() != "invalid username or password" {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestAuthService_Login_Disabled(t *testing.T) {
	svc := NewAuthService(&mockAuthRepo{})
	_, _, _, err := svc.Login("disabled", "anything")
	if err == nil {
		t.Fatal("expected error for disabled account")
	}
}

func TestAuthService_Login_NotFound(t *testing.T) {
	svc := NewAuthService(&mockAuthRepo{})
	_, _, _, err := svc.Login("nobody", "anything")
	if err == nil {
		t.Fatal("expected error for non-existent user")
	}
}
