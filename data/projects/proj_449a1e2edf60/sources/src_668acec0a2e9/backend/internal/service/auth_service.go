package service

import (
	"errors"
	"fmt"
	"log"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/middleware"

	"golang.org/x/crypto/bcrypt"
)

type EmployeeRepoInterface interface {
	FindByUsername(username string) (*model.Employee, error)
}

type AuthService struct {
	repo EmployeeRepoInterface
}

func NewAuthService(repo EmployeeRepoInterface) *AuthService {
	return &AuthService{repo: repo}
}

// Login 用户登录：验证用户名密码，检查账号状态，生成 JWT token
func (s *AuthService) Login(username, password string) (string, string, *model.Employee, error) {
	log.Printf("[AuthService] Login called, username: %s", username)

	emp, err := s.repo.FindByUsername(username)
	if err != nil {
		log.Printf("[AuthService] Login failed: user %s not found", username)
		return "", "", nil, errors.New("invalid username or password")
	}

	if emp.Status == 0 {
		log.Printf("[AuthService] Login failed: account %s is disabled", username)
		return "", "", nil, errors.New("account disabled")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(emp.PasswordHash), []byte(password)); err != nil {
		log.Printf("[AuthService] Login failed: invalid password for user %s", username)
		return "", "", nil, errors.New("invalid username or password")
	}

	accessToken, refreshToken, err := middleware.GenerateToken(emp)
	if err != nil {
		log.Printf("[AuthService] Login failed: token generation error: %v", err)
		return "", "", nil, fmt.Errorf("failed to generate token: %w", err)
	}

	log.Printf("[AuthService] Login succeeded: user %s (role: %s)", emp.Username, emp.Role)
	return accessToken, refreshToken, emp, nil
}
