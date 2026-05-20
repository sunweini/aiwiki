package service

import (
	"errors"
	"log"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type ActivityService struct {
	db *gorm.DB
}

func NewActivityService(db *gorm.DB) *ActivityService {
	return &ActivityService{db: db}
}

// List 分页查询活动列表，支持条件过滤，预加载创建人信息
func (s *ActivityService) List(page, pageSize int, filters map[string]interface{}) ([]model.Activity, int64, error) {
	log.Printf("[ActivityService] List called, page: %d, pageSize: %d", page, pageSize)
	var activities []model.Activity
	var total int64

	query := s.db.Model(&model.Activity{}).Preload("Creator")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&activities).Error; err != nil {
		log.Printf("[ActivityService] List failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[ActivityService] List succeeded: total %d", total)
	return activities, total, nil
}

// Create 创建新活动
func (s *ActivityService) Create(act *model.Activity) error {
	log.Printf("[ActivityService] Create called, title: %s, createdBy: %d", act.Title, act.CreatedBy)
	if err := s.db.Create(act).Error; err != nil {
		log.Printf("[ActivityService] Create failed: %v", err)
		return err
	}
	log.Printf("[ActivityService] Create succeeded: id: %d", act.ID)
	return nil
}

// Update 更新活动信息
func (s *ActivityService) Update(id int64, updates map[string]interface{}) error {
	log.Printf("[ActivityService] Update called, id: %d", id)
	_, err := s.FindActivity(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[ActivityService] Update failed: activity %d not found", id)
		return errors.New("activity not found")
	}
	if err := s.db.Model(&model.Activity{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		log.Printf("[ActivityService] Update failed: %v", err)
		return err
	}
	log.Printf("[ActivityService] Update succeeded: id: %d", id)
	return nil
}

// Delete 删除活动
func (s *ActivityService) Delete(id int64) error {
	log.Printf("[ActivityService] Delete called, id: %d", id)
	if err := s.db.Delete(&model.Activity{}, id).Error; err != nil {
		log.Printf("[ActivityService] Delete failed: %v", err)
		return err
	}
	log.Printf("[ActivityService] Delete succeeded: id: %d", id)
	return nil
}

// FindActivity 根据ID查询活动详情（包含创建人）
func (s *ActivityService) FindActivity(id int64) (*model.Activity, error) {
	var act model.Activity
	err := s.db.Preload("Creator").First(&act, id).Error
	if err != nil {
		return nil, err
	}
	return &act, nil
}

// GetStats 获取活动统计数据（曝光量、参与人数、转化订单数、核销率）
func (s *ActivityService) GetStats(id int64) (map[string]interface{}, error) {
	log.Printf("[ActivityService] GetStats called, id: %d", id)
	act, err := s.FindActivity(id)
	if err != nil {
		log.Printf("[ActivityService] GetStats failed: activity %d not found", id)
		return nil, err
	}
	return map[string]interface{}{
		"exposure_count":    act.ExposureCount,
		"participant_count": act.ParticipantCount,
		"conversion_orders": act.ConversionOrders,
		"verification_rate": act.VerificationRate,
	}, nil
}
