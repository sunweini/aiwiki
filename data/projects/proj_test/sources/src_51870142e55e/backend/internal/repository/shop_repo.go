package repository

import (
	"yfsc-platform-v2/backend/internal/model"
	"gorm.io/gorm"
)

type ShopRepo struct {
	db *gorm.DB
}

func NewShopRepo(db *gorm.DB) *ShopRepo {
	return &ShopRepo{db: db}
}

func (r *ShopRepo) List(page, pageSize int, filters map[string]interface{}) ([]model.Shop, int64, error) {
	var shops []model.Shop
	var total int64

	query := r.db.Model(&model.Shop{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Park").Preload("Type").Offset(offset).Limit(pageSize).Order("id DESC").Find(&shops).Error; err != nil {
		return nil, 0, err
	}

	return shops, total, nil
}

func (r *ShopRepo) FindByID(id int64) (*model.Shop, error) {
	var shop model.Shop
	err := r.db.Preload("Park").Preload("Type").First(&shop, id).Error
	if err != nil {
		return nil, err
	}
	return &shop, nil
}

func (r *ShopRepo) Create(shop *model.Shop) error {
	return r.db.Create(shop).Error
}

func (r *ShopRepo) Update(id int64, updates map[string]interface{}) error {
	return r.db.Model(&model.Shop{}).Where("id = ?", id).Updates(updates).Error
}

func (r *ShopRepo) Delete(id int64) error {
	return r.db.Delete(&model.Shop{}, id).Error
}

func (r *ShopRepo) Stats() (map[string]int64, error) {
	var results []struct {
		Status int8
		Count  int64
	}
	err := r.db.Model(&model.Shop{}).Select("status, count(*) as count").Group("status").Find(&results).Error
	if err != nil {
		return nil, err
	}

	stats := map[string]int64{}
	for _, r := range results {
		switch r.Status {
		case 0:
			stats["closed"] = r.Count
		case 1:
			stats["open"] = r.Count
		case 2:
			stats["resting"] = r.Count
		}
	}
	return stats, nil
}

func (r *ShopRepo) FindByParkID(parkID int64) ([]model.Shop, error) {
	var shops []model.Shop
	err := r.db.Where("park_id = ?", parkID).Find(&shops).Error
	return shops, err
}
