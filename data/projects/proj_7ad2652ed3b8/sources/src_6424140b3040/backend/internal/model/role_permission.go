package model

type RolePermission struct {
	RoleID       int64 `gorm:"primaryKey" json:"role_id"`
	PermissionID int64 `gorm:"primaryKey" json:"permission_id"`
}

func (RolePermission) TableName() string { return "role_permission" }
