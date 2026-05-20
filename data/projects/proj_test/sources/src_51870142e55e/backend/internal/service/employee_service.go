package service

import (
	"errors"
	"fmt"
	"log"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type EmployeeService struct {
	repo *repository.EmployeeRepo
}

func NewEmployeeService(repo *repository.EmployeeRepo) *EmployeeService {
	return &EmployeeService{repo: repo}
}

// List 分页查询员工列表，支持条件过滤
func (s *EmployeeService) List(page, pageSize int, filters map[string]interface{}) ([]model.Employee, int64, error) {
	log.Printf("[EmployeeService] List called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.repo.List(page, pageSize, filters)
}

// GetByID 根据ID查询员工详情
func (s *EmployeeService) GetByID(id int64) (*model.Employee, error) {
	log.Printf("[EmployeeService] GetByID called, id: %d", id)
	return s.repo.FindByID(id)
}

// Create 创建员工账号（用户名去重，密码自动哈希）
func (s *EmployeeService) Create(emp *model.Employee) error {
	log.Printf("[EmployeeService] Create called, username: %s, role: %s", emp.Username, emp.Role)
	existing, _ := s.repo.FindByUsername(emp.Username)
	if existing != nil {
		log.Printf("[EmployeeService] Create failed: username %s already exists", emp.Username)
		return errors.New("username already exists")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(emp.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[EmployeeService] Create failed: password hash error %v", err)
		return fmt.Errorf("failed to hash password: %w", err)
	}
	emp.PasswordHash = string(hashed)

	if err := s.repo.Create(emp); err != nil {
		log.Printf("[EmployeeService] Create failed: %v", err)
		return err
	}
	log.Printf("[EmployeeService] Create succeeded: id: %d, username: %s", emp.ID, emp.Username)
	return nil
}

type UpdateEmployeeRequest struct {
	RealName string `json:"real_name"`
	Phone    string `json:"phone"`
	Gender   int8   `json:"gender"`
	ParkID   *int64 `json:"park_id"`
	ShopID   *int64 `json:"shop_id"`
	Position string `json:"position"`
}

// Update 更新员工基本信息（不包含密码）
func (s *EmployeeService) Update(id int64, req UpdateEmployeeRequest) error {
	log.Printf("[EmployeeService] Update called, id: %d", id)
	_, err := s.repo.FindByID(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[EmployeeService] Update failed: employee %d not found", id)
		return errors.New("employee not found")
	}

	if err := s.repo.Update(id, map[string]interface{}{
		"real_name": req.RealName,
		"phone":     req.Phone,
		"gender":    req.Gender,
		"park_id":   req.ParkID,
		"shop_id":   req.ShopID,
		"position":  req.Position,
	}); err != nil {
		log.Printf("[EmployeeService] Update failed: %v", err)
		return err
	}
	log.Printf("[EmployeeService] Update succeeded: id: %d", id)
	return nil
}

// Delete 删除员工
func (s *EmployeeService) Delete(id int64) error {
	log.Printf("[EmployeeService] Delete called, id: %d", id)
	if err := s.repo.Delete(id); err != nil {
		log.Printf("[EmployeeService] Delete failed: %v", err)
		return err
	}
	log.Printf("[EmployeeService] Delete succeeded: id: %d", id)
	return nil
}

// ToggleStatus 切换员工状态（启用/禁用）
func (s *EmployeeService) ToggleStatus(id int64, status int8) error {
	log.Printf("[EmployeeService] ToggleStatus called, id: %d, status: %d", id, status)
	if err := s.repo.Update(id, map[string]interface{}{"status": status}); err != nil {
		log.Printf("[EmployeeService] ToggleStatus failed: %v", err)
		return err
	}
	log.Printf("[EmployeeService] ToggleStatus succeeded: id: %d", id)
	return nil
}

// ResetPassword 重置员工密码（自动生成新哈希）
func (s *EmployeeService) ResetPassword(id int64, newPassword string) error {
	log.Printf("[EmployeeService] ResetPassword called, id: %d", id)
	hashed, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[EmployeeService] ResetPassword failed: hash error %v", err)
		return err
	}
	if err := s.repo.Update(id, map[string]interface{}{"password_hash": string(hashed)}); err != nil {
		log.Printf("[EmployeeService] ResetPassword failed: %v", err)
		return err
	}
	log.Printf("[EmployeeService] ResetPassword succeeded: id: %d", id)
	return nil
}
