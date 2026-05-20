package database

import (
	"yfsc-platform-v2/backend/internal/model"
	"gorm.io/gorm"
)

func RunMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&model.Employee{},
		&model.Role{},
		&model.Permission{},
		&model.RolePermission{},
		&model.Park{},
		&model.Shop{},
		&model.ShopType{},
		&model.User{},
		&model.Order{},
		&model.RechargeRecord{},
		&model.RefundRecord{},
		&model.Activity{},
		&model.Position{},
		&model.GateDevice{},
		&model.GateEntryRecord{},
		&model.WithdrawApplication{},
		&model.Reconciliation{},
		&model.OperationLog{},
		&model.MiniProgramConfig{},
		&model.MeituanStoreMapping{},
		&model.MeituanVerifyRecord{},
		&model.MeituanSettlement{},
		&model.MeituanApiConfig{},
		&model.DouyinStoreMapping{},
		&model.DouyinVerifyRecord{},
		&model.DouyinSettlement{},
		&model.DouyinApiConfig{},
		&model.PaymentConfig{},
	)
}
