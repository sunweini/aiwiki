package model

type Park struct {
	BaseModel
	Name          string `gorm:"size:100;not null" json:"name"`
	Code          string `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Address       string `gorm:"size:255" json:"address"`
	ContactName   string `gorm:"size:50" json:"contact_name"`
	ContactPhone  string `gorm:"size:20" json:"contact_phone"`
	Status        int8   `gorm:"default:1" json:"status"` // 0=closed 1=open
	BusinessHours string `gorm:"size:100" json:"business_hours"`
	Logo          string `gorm:"size:500" json:"logo"`
	Description   string `gorm:"type:text" json:"description"`
}

func (Park) TableName() string { return "park" }
