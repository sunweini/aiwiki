package repository

import (
	"time"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type RefundRepo struct {
	db *gorm.DB
}

func NewRefundRepo(db *gorm.DB) *RefundRepo {
	return &RefundRepo{db: db}
}

func (r *RefundRepo) List(page, pageSize int, filters map[string]interface{}) ([]model.RefundRecord, int64, error) {
	var records []model.RefundRecord
	var total int64

	query := r.db.Model(&model.RefundRecord{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Order").Preload("User").Preload("Reviewer").Offset(offset).Limit(pageSize).Order("id DESC").Find(&records).Error; err != nil {
		return nil, 0, err
	}

	return records, total, nil
}

func (r *RefundRepo) FindByID(id int64) (*model.RefundRecord, error) {
	var record model.RefundRecord
	err := r.db.Preload("Order").Preload("User").First(&record, id).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

func (r *RefundRepo) Create(record *model.RefundRecord) error {
	return r.db.Create(record).Error
}

func (r *RefundRepo) Approve(id int64, reviewerID int64, note string, reviewedAt time.Time) error {
	return r.db.Model(&model.RefundRecord{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "已退款",
		"reviewer_id": reviewerID,
		"review_note": note,
		"reviewed_at": reviewedAt,
		"refunded_at": reviewedAt,
	}).Error
}

func (r *RefundRepo) Reject(id int64, reviewerID int64, note string) error {
	return r.db.Model(&model.RefundRecord{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "已驳回",
		"reviewer_id": reviewerID,
		"review_note": note,
	}).Error
}
