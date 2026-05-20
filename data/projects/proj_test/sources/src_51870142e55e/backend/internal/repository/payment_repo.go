package repository

import (
	"yfsc-platform-v2/backend/internal/model"
	"gorm.io/gorm"
)

type PaymentRepo struct {
	db *gorm.DB
}

func NewPaymentRepo(db *gorm.DB) *PaymentRepo {
	return &PaymentRepo{db: db}
}

func (r *PaymentRepo) FindByShopAndPlatform(shopID int64, platform string) (*model.PaymentConfig, error) {
	var cfg model.PaymentConfig
	err := r.db.Where("shop_id = ? AND platform = ?", shopID, platform).First(&cfg).Error
	if err != nil {
		return nil, err
	}
	return &cfg, nil
}

func (r *PaymentRepo) ListByShop(shopID int64) ([]model.PaymentConfig, error) {
	var cfgs []model.PaymentConfig
	err := r.db.Where("shop_id = ?", shopID).Find(&cfgs).Error
	return cfgs, err
}

func (r *PaymentRepo) Upsert(cfg *model.PaymentConfig) error {
	var existing model.PaymentConfig
	err := r.db.Where("shop_id = ? AND platform = ?", cfg.ShopID, cfg.Platform).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(cfg).Error
	}
	return r.db.Model(&model.PaymentConfig{}).Where("id = ?", existing.ID).Updates(map[string]interface{}{
		"app_id": cfg.AppID, "merchant_id": cfg.MerchantID, "notify_url": cfg.NotifyURL,
		"status": cfg.Status,
	}).Error
}

func (r *PaymentRepo) UpdateSecrets(id int64, secrets map[string]interface{}) error {
	return r.db.Model(&model.PaymentConfig{}).Where("id = ?", id).Updates(secrets).Error
}
