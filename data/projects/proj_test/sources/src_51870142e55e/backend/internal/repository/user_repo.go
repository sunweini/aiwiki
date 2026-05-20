package repository

import (
	"strings"

	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) List(page, pageSize int, filters map[string]interface{}) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := r.db.Model(&model.User{})
	for k, v := range filters {
		if k == "nickname" || k == "phone" {
			val := strings.NewReplacer("%", "\\%", "_", "\\_").Replace(v.(string))
			query = query.Where(k+" LIKE ? ESCAPE '\\'", "%"+val+"%")
		} else {
			query = query.Where(k+" = ?", v)
		}
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepo) FindByID(id int64) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) FindByPhone(phone string) (*model.User, error) {
	var user model.User
	err := r.db.Where("phone = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) FindByOpenID(openID string) (*model.User, error) {
	var user model.User
	err := r.db.Where("openid = ?", openID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepo) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepo) Update(id int64, updates map[string]interface{}) error {
	return r.db.Model(&model.User{}).Where("id = ?", id).Updates(updates).Error
}

func (r *UserRepo) IncrementBalance(userID int64, amount float64) error {
	return r.db.Model(&model.User{}).Where("id = ?", userID).
		UpdateColumn("balance", gorm.Expr("balance + ?", amount)).Error
}

func (r *UserRepo) Stats() (map[string]interface{}, error) {
	var total int64
	var todayNew int64
	r.db.Model(&model.User{}).Count(&total)
	r.db.Model(&model.User{}).Where("DATE(created_at) = CURDATE()").Count(&todayNew)

	return map[string]interface{}{
		"total":    total,
		"today_new": todayNew,
	}, nil
}

func (r *UserRepo) RechargeList(userID int64, page, pageSize int) ([]model.RechargeRecord, int64, error) {
	var records []model.RechargeRecord
	var total int64

	query := r.db.Model(&model.RechargeRecord{}).Where("user_id = ?", userID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&records).Error; err != nil {
		return nil, 0, err
	}

	return records, total, nil
}
