package repository

import (
	"time"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type OrderRepo struct {
	db *gorm.DB
}

func NewOrderRepo(db *gorm.DB) *OrderRepo {
	return &OrderRepo{db: db}
}

func (r *OrderRepo) List(page, pageSize int, filters map[string]interface{}) ([]model.Order, int64, error) {
	var orders []model.Order
	var total int64

	query := r.db.Model(&model.Order{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("User").Preload("Shop").Offset(offset).Limit(pageSize).Order("id DESC").Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (r *OrderRepo) FindByID(id int64) (*model.Order, error) {
	var order model.Order
	err := r.db.Preload("User").Preload("Shop").First(&order, id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepo) FindByOrderNo(orderNo string) (*model.Order, error) {
	var order model.Order
	err := r.db.Where("order_no = ?", orderNo).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepo) Create(order *model.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepo) UpdateStatus(id int64, status string) error {
	return r.db.Model(&model.Order{}).Where("id = ?", id).Update("status", status).Error
}

func (r *OrderRepo) Verify(id int64) error {
	now := time.Now()
	return r.db.Model(&model.Order{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":      "已核销",
		"verified_at": now,
	}).Error
}

func (r *OrderRepo) Stats(shopID *int64) (map[string]int64, error) {
	query := r.db.Model(&model.Order{})
	if shopID != nil {
		query = query.Where("shop_id = ?", *shopID)
	}

	var results []struct {
		Status string
		Count  int64
	}
	if err := query.Select("status, count(*) as count").Group("status").Find(&results).Error; err != nil {
		return nil, err
	}

	stats := map[string]int64{}
	for _, r := range results {
		stats[r.Status] = r.Count
	}
	return stats, nil
}
