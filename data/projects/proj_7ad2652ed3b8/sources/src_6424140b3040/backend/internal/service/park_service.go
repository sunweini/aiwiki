package service

import (
	"errors"
	"log"

	"yfsc-platform-v2/backend/internal/model"
	"yfsc-platform-v2/backend/internal/repository"

	"gorm.io/gorm"
)

type ParkService struct {
	repo *repository.ParkRepo
}

func NewParkService(repo *repository.ParkRepo) *ParkService {
	return &ParkService{repo: repo}
}

// List 分页查询园区列表，支持条件过滤
func (s *ParkService) List(page, pageSize int, filters map[string]interface{}) ([]model.Park, int64, error) {
	log.Printf("[ParkService] List called, page: %d, pageSize: %d", page, pageSize)
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	return s.repo.List(page, pageSize, filters)
}

// GetByID 根据ID查询园区详情
func (s *ParkService) GetByID(id int64) (*model.Park, error) {
	log.Printf("[ParkService] GetByID called, id: %d", id)
	return s.repo.FindByID(id)
}

// Create 创建新园区（检查编码去重）
func (s *ParkService) Create(park *model.Park) error {
	log.Printf("[ParkService] Create called, code: %s, name: %s", park.Code, park.Name)
	existing, _ := s.repo.FindByCode(park.Code)
	if existing != nil {
		log.Printf("[ParkService] Create failed: park code %s already exists", park.Code)
		return errors.New("park code already exists")
	}
	if err := s.repo.Create(park); err != nil {
		log.Printf("[ParkService] Create failed: %v", err)
		return err
	}
	log.Printf("[ParkService] Create succeeded: id: %d", park.ID)
	return nil
}

// Update 更新园区信息
func (s *ParkService) Update(id int64, updates map[string]interface{}) error {
	log.Printf("[ParkService] Update called, id: %d", id)
	_, err := s.repo.FindByID(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[ParkService] Update failed: park %d not found", id)
		return errors.New("park not found")
	}
	if err := s.repo.Update(id, updates); err != nil {
		log.Printf("[ParkService] Update failed: %v", err)
		return err
	}
	log.Printf("[ParkService] Update succeeded: id: %d", id)
	return nil
}

// Delete 删除园区
func (s *ParkService) Delete(id int64) error {
	log.Printf("[ParkService] Delete called, id: %d", id)
	if err := s.repo.Delete(id); err != nil {
		log.Printf("[ParkService] Delete failed: %v", err)
		return err
	}
	log.Printf("[ParkService] Delete succeeded: id: %d", id)
	return nil
}

// ToggleStatus 切换园区状态（启用/禁用）
func (s *ParkService) ToggleStatus(id int64, status int8) error {
	log.Printf("[ParkService] ToggleStatus called, id: %d, status: %d", id, status)
	if err := s.repo.Update(id, map[string]interface{}{"status": status}); err != nil {
		log.Printf("[ParkService] ToggleStatus failed: %v", err)
		return err
	}
	log.Printf("[ParkService] ToggleStatus succeeded: id: %d", id)
	return nil
}
