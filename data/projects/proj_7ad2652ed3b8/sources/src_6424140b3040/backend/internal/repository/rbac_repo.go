package repository

import (
	"yfsc-platform-v2/backend/internal/model"

	"gorm.io/gorm"
)

type RBACRepo struct {
	db *gorm.DB
}

func NewRBACRepo(db *gorm.DB) *RBACRepo {
	return &RBACRepo{db: db}
}

type PermissionInfo struct {
	Module string `json:"module"`
	Action string `json:"action"`
	Label  string `json:"label"`
}

func (r *RBACRepo) GetPermissionsByRole(roleCode string) ([]PermissionInfo, error) {
	var perms []PermissionInfo
	err := r.db.Table("permission").
		Select("permission.module, permission.action, permission.label").
		Joins("INNER JOIN role_permission ON role_permission.permission_id = permission.id").
		Joins("INNER JOIN role ON role.id = role_permission.role_id").
		Where("role.code = ?", roleCode).
		Find(&perms).Error
	return perms, err
}

func (r *RBACRepo) ListRoles() ([]model.Role, error) {
	var roles []model.Role
	err := r.db.Find(&roles).Error
	return roles, err
}

func (r *RBACRepo) GetRoleByCode(code string) (*model.Role, error) {
	var role model.Role
	err := r.db.Where("code = ?", code).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

func (r *RBACRepo) ListAllPermissions() ([]model.Permission, error) {
	var perms []model.Permission
	err := r.db.Order("module, action").Find(&perms).Error
	return perms, err
}

func (r *RBACRepo) GetPermissionIDsByRole(roleID int64) ([]int64, error) {
	var ids []int64
	err := r.db.Model(&model.RolePermission{}).Where("role_id = ?", roleID).Pluck("permission_id", &ids).Error
	return ids, err
}

func (r *RBACRepo) SetRolePermissions(roleID int64, permIDs []int64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("role_id = ?", roleID).Delete(&model.RolePermission{}).Error; err != nil {
			return err
		}
		for _, pid := range permIDs {
			if err := tx.Create(&model.RolePermission{RoleID: roleID, PermissionID: pid}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
