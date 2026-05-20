package repository

import (
	"yfsc-platform-v2/backend/internal/model"
	"gorm.io/gorm"
)

type ParkRepo struct {
	db *gorm.DB
}

func NewParkRepo(db *gorm.DB) *ParkRepo {
	return &ParkRepo{db: db}
}

func (r *ParkRepo) List(page, pageSize int, filters map[string]interface{}) ([]model.Park, int64, error) {
	var parks []model.Park
	var total int64

	query := r.db.Model(&model.Park{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&parks).Error; err != nil {
		return nil, 0, err
	}

	return parks, total, nil
}

func (r *ParkRepo) FindByID(id int64) (*model.Park, error) {
	var park model.Park
	err := r.db.First(&park, id).Error
	if err != nil {
		return nil, err
	}
	return &park, nil
}

func (r *ParkRepo) FindByCode(code string) (*model.Park, error) {
	var park model.Park
	err := r.db.Where("code = ?", code).First(&park).Error
	if err != nil {
		return nil, err
	}
	return &park, nil
}

func (r *ParkRepo) Create(park *model.Park) error {
	return r.db.Create(park).Error
}

func (r *ParkRepo) Update(id int64, updates map[string]interface{}) error {
	return r.db.Model(&model.Park{}).Where("id = ?", id).Updates(updates).Error
}

func (r *ParkRepo) Delete(id int64) error {
	return r.db.Delete(&model.Park{}, id).Error
}
