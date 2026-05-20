package service

import (
	"errors"
	"log"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type PositionService struct {
	db *gorm.DB
}

func NewPositionService(db *gorm.DB) *PositionService {
	return &PositionService{db: db}
}

// List 分页查询岗位列表
func (s *PositionService) List(page, pageSize int) ([]model.Position, int64, error) {
	log.Printf("[PositionService] List called, page: %d, pageSize: %d", page, pageSize)
	var positions []model.Position
	var total int64

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	query := s.db.Model(&model.Position{})
	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&positions).Error; err != nil {
		log.Printf("[PositionService] List failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[PositionService] List succeeded: total %d", total)
	return positions, total, nil
}

// Create 创建新岗位
func (s *PositionService) Create(pos *model.Position) error {
	log.Printf("[PositionService] Create called, name: %s, code: %s", pos.Name, pos.Code)
	if err := s.db.Create(pos).Error; err != nil {
		log.Printf("[PositionService] Create failed: %v", err)
		return err
	}
	log.Printf("[PositionService] Create succeeded: id: %d", pos.ID)
	return nil
}

// Update 更新岗位信息
func (s *PositionService) Update(id int64, updates map[string]interface{}) error {
	log.Printf("[PositionService] Update called, id: %d", id)
	_, err := s.findPosition(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[PositionService] Update failed: position %d not found", id)
		return errors.New("position not found")
	}
	if err := s.db.Model(&model.Position{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		log.Printf("[PositionService] Update failed: %v", err)
		return err
	}
	log.Printf("[PositionService] Update succeeded: id: %d", id)
	return nil
}

// Delete 删除岗位
func (s *PositionService) Delete(id int64) error {
	log.Printf("[PositionService] Delete called, id: %d", id)
	if err := s.db.Where("id = ?", id).Delete(&model.Position{}).Error; err != nil {
		log.Printf("[PositionService] Delete failed: %v", err)
		return err
	}
	log.Printf("[PositionService] Delete succeeded: id: %d", id)
	return nil
}

func (s *PositionService) findPosition(id int64) (*model.Position, error) {
	var pos model.Position
	err := s.db.First(&pos, id).Error
	return &pos, err
}
