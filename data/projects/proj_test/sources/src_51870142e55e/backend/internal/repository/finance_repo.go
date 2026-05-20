package repository

import (
	"time"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type FinanceRepo struct {
	db *gorm.DB
}

func NewFinanceRepo(db *gorm.DB) *FinanceRepo {
	return &FinanceRepo{db: db}
}

func (r *FinanceRepo) ListWithdraw(page, pageSize int, filters map[string]interface{}) ([]model.WithdrawApplication, int64, error) {
	var withdraws []model.WithdrawApplication
	var total int64

	query := r.db.Model(&model.WithdrawApplication{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Shop").Offset(offset).Limit(pageSize).Order("id DESC").Find(&withdraws).Error; err != nil {
		return nil, 0, err
	}

	return withdraws, total, nil
}

func (r *FinanceRepo) CreateWithdraw(w *model.WithdrawApplication) error {
	return r.db.Create(w).Error
}

func (r *FinanceRepo) UpdateWithdrawStatus(id int64, status string) error {
	return r.db.Model(&model.WithdrawApplication{}).Where("id = ?", id).Update("status", status).Error
}

func (r *FinanceRepo) ApproveWithdraw(id int64, reviewerID int64, note string) error {
	now := time.Now()
	return r.db.Model(&model.WithdrawApplication{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "已通过",
		"reviewer_id": reviewerID,
		"review_note": note,
		"reviewed_at": now,
	}).Error
}

func (r *FinanceRepo) RejectWithdraw(id int64, reviewerID int64, note string) error {
	return r.db.Model(&model.WithdrawApplication{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "已驳回",
		"reviewer_id": reviewerID,
		"review_note": note,
	}).Error
}

func (r *FinanceRepo) CreateReconciliation(rec *model.Reconciliation) error {
	return r.db.Create(rec).Error
}

func (r *FinanceRepo) ListReconciliation(page, pageSize int, filters map[string]interface{}) ([]model.Reconciliation, int64, error) {
	var reconciles []model.Reconciliation
	var total int64

	query := r.db.Model(&model.Reconciliation{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Park").Preload("Shop").Offset(offset).Limit(pageSize).Order("date DESC").Find(&reconciles).Error; err != nil {
		return nil, 0, err
	}

	return reconciles, total, nil
}
