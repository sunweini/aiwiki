package model

type Role struct {
	BaseModel
	Name        string `gorm:"size:50;not null" json:"name"`
	Code        string `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Layer       string `gorm:"size:20;not null" json:"layer"` // 总部/园区/商户
	Description string `gorm:"size:255" json:"description"`
}

func (Role) TableName() string { return "role" }
