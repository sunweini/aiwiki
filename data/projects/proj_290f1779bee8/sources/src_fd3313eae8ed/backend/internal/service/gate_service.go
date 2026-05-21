package service

import (
	"errors"
	"log"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type GateService struct {
	db *gorm.DB
}

func NewGateService(db *gorm.DB) *GateService {
	return &GateService{db: db}
}

// ListGates 分页查询闸机设备列表，支持按园区过滤
func (s *GateService) ListGates(page, pageSize int, parkID *int64) ([]model.GateDevice, int64, error) {
	log.Printf("[GateService] ListGates called, parkID: %v", parkID)
	var gates []model.GateDevice
	var total int64

	query := s.db.Model(&model.GateDevice{}).Preload("Park")
	if parkID != nil {
		query = query.Where("park_id = ?", *parkID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&gates).Error; err != nil {
		log.Printf("[GateService] ListGates failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[GateService] ListGates succeeded: total %d", total)
	return gates, total, nil
}

// CreateGate 创建新闸机设备
func (s *GateService) CreateGate(gate *model.GateDevice) error {
	log.Printf("[GateService] CreateGate called, parkID: %d, name: %s", gate.ParkID, gate.Name)
	if err := s.db.Create(gate).Error; err != nil {
		log.Printf("[GateService] CreateGate failed: %v", err)
		return err
	}
	log.Printf("[GateService] CreateGate succeeded: id: %d", gate.ID)
	return nil
}

// UpdateGate 更新闸机信息
func (s *GateService) UpdateGate(id int64, updates map[string]interface{}) error {
	log.Printf("[GateService] UpdateGate called, id: %d", id)
	_, err := s.FindGate(id)
	if err == gorm.ErrRecordNotFound {
		log.Printf("[GateService] UpdateGate failed: gate %d not found", id)
		return errors.New("gate not found")
	}
	if err := s.db.Model(&model.GateDevice{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		log.Printf("[GateService] UpdateGate failed: %v", err)
		return err
	}
	log.Printf("[GateService] UpdateGate succeeded: id: %d", id)
	return nil
}

// DeleteGate 删除闸机
func (s *GateService) DeleteGate(id int64) error {
	log.Printf("[GateService] DeleteGate called, id: %d", id)
	if err := s.db.Delete(&model.GateDevice{}, id).Error; err != nil {
		log.Printf("[GateService] DeleteGate failed: %v", err)
		return err
	}
	log.Printf("[GateService] DeleteGate succeeded: id: %d", id)
	return nil
}

// FindGate 根据ID查询闸机详情（包含关联园区）
func (s *GateService) FindGate(id int64) (*model.GateDevice, error) {
	log.Printf("[GateService] FindGate called, id: %d", id)
	var gate model.GateDevice
	err := s.db.Preload("Park").First(&gate, id).Error
	if err != nil {
		log.Printf("[GateService] FindGate failed: gate %d not found", id)
		return nil, err
	}
	return &gate, nil
}

// GetGateEntries 分页查询闸机进出记录
func (s *GateService) GetGateEntries(page, pageSize int, gateID *int64) ([]model.GateEntryRecord, int64, error) {
	log.Printf("[GateService] GetGateEntries called, gateID: %v", gateID)
	var entries []model.GateEntryRecord
	var total int64

	query := s.db.Model(&model.GateEntryRecord{}).Preload("User").Preload("Gate")
	if gateID != nil {
		query = query.Where("gate_id = ?", *gateID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("entry_time DESC").Find(&entries).Error; err != nil {
		log.Printf("[GateService] GetGateEntries failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[GateService] GetGateEntries succeeded: total %d", total)
	return entries, total, nil
}

// ListFaceRecords 分页查询人脸录入记录列表
func (s *GateService) ListFaceRecords(page, pageSize int, filters map[string]interface{}) ([]model.FaceRecord, int64, error) {
	log.Printf("[GateService] ListFaceRecords called, filters: %v", filters)
	var records []model.FaceRecord
	var total int64

	query := s.db.Model(&model.FaceRecord{}).Preload("User")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&records).Error; err != nil {
		log.Printf("[GateService] ListFaceRecords failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[GateService] ListFaceRecords succeeded: total %d", total)
	return records, total, nil
}

// DeleteFaceRecord 删除指定人脸记录
func (s *GateService) DeleteFaceRecord(id int64) error {
	log.Printf("[GateService] DeleteFaceRecord called, id: %d", id)
	if err := s.db.Delete(&model.FaceRecord{}, id).Error; err != nil {
		log.Printf("[GateService] DeleteFaceRecord failed: %v", err)
		return err
	}
	log.Printf("[GateService] DeleteFaceRecord succeeded: id: %d", id)
	return nil
}

// ListEntryRecords 分页查询全局进出记录列表
func (s *GateService) ListEntryRecords(page, pageSize int, filters map[string]interface{}) ([]model.GateEntryRecord, int64, error) {
	log.Printf("[GateService] ListEntryRecords called, filters: %v", filters)
	var entries []model.GateEntryRecord
	var total int64

	query := s.db.Model(&model.GateEntryRecord{}).Preload("User").Preload("Gate")
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("entry_time DESC").Find(&entries).Error; err != nil {
		log.Printf("[GateService] ListEntryRecords failed: %v", err)
		return nil, 0, err
	}
	log.Printf("[GateService] ListEntryRecords succeeded: total %d", total)
	return entries, total, nil
}
