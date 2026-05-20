package service

import (
	"log"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type SettingsService struct {
	db *gorm.DB
}

func NewSettingsService(db *gorm.DB) *SettingsService {
	return &SettingsService{db: db}
}

// GetMPConfig 获取指定类型的小程序配置
func (s *SettingsService) GetMPConfig(configType string) (*model.MiniProgramConfig, error) {
	log.Printf("[SettingsService] GetMPConfig called, configType: %s", configType)
	var cfg model.MiniProgramConfig
	err := s.db.Where("type = ?", configType).First(&cfg).Error
	if err != nil {
		log.Printf("[SettingsService] GetMPConfig failed: config type %s not found", configType)
		return nil, err
	}
	return &cfg, nil
}

// UpdateMPConfig 更新指定类型的小程序配置
func (s *SettingsService) UpdateMPConfig(configType string, updates map[string]interface{}) error {
	log.Printf("[SettingsService] UpdateMPConfig called, configType: %s", configType)
	if err := s.db.Model(&model.MiniProgramConfig{}).Where("type = ?", configType).Updates(updates).Error; err != nil {
		log.Printf("[SettingsService] UpdateMPConfig failed: %v", err)
		return err
	}
	log.Printf("[SettingsService] UpdateMPConfig succeeded: type: %s", configType)
	return nil
}

// ListLogs 分页查询操作日志
func (s *SettingsService) ListLogs(page, pageSize int, filters map[string]interface{}) ([]model.OperationLog, int64, error) {
	log.Printf("[SettingsService] ListLogs called, page: %d, pageSize: %d", page, pageSize)
	var logs []model.OperationLog
	var total int64

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	query := s.db.Model(&model.OperationLog{}).Preload("Employee")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&logs).Error; err != nil {
		log.Printf("[SettingsService] ListLogs failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[SettingsService] ListLogs succeeded: total %d", total)
	return logs, total, nil
}
