package repository

import (
	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type EmployeeRepo struct {
	db *gorm.DB
}

func NewEmployeeRepo(db *gorm.DB) *EmployeeRepo {
	return &EmployeeRepo{db: db}
}

func (r *EmployeeRepo) FindByUsername(username string) (*model.Employee, error) {
	var emp model.Employee
	err := r.db.Preload("Park").Preload("Shop").Where("username = ?", username).First(&emp).Error
	if err != nil {
		return nil, err
	}
	return &emp, nil
}

func (r *EmployeeRepo) FindByID(id int64) (*model.Employee, error) {
	var emp model.Employee
	err := r.db.Preload("Park").Preload("Shop").First(&emp, id).Error
	if err != nil {
		return nil, err
	}
	return &emp, nil
}

func (r *EmployeeRepo) List(page, pageSize int, filters map[string]interface{}) ([]model.Employee, int64, error) {
	var employees []model.Employee
	var total int64

	query := r.db.Model(&model.Employee{})
	for k, v := range filters {
		query = query.Where(k+" = ?", v)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Park").Preload("Shop").Offset(offset).Limit(pageSize).Order("id DESC").Find(&employees).Error; err != nil {
		return nil, 0, err
	}

	return employees, total, nil
}

func (r *EmployeeRepo) Create(emp *model.Employee) error {
	return r.db.Create(emp).Error
}

func (r *EmployeeRepo) Update(id int64, updates map[string]interface{}) error {
	return r.db.Model(&model.Employee{}).Where("id = ?", id).Updates(updates).Error
}

func (r *EmployeeRepo) Delete(id int64) error {
	return r.db.Delete(&model.Employee{}, id).Error
}
