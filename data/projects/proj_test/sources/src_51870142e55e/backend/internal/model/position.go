package model

type Position struct {
	BaseModel
	Name         string `gorm:"size:100;not null" json:"name"`
	Code         string `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Role         string `gorm:"size:50" json:"role"`
	Description  string `gorm:"type:text" json:"description"`
	Requirements string `gorm:"type:text" json:"requirements"`
	Status       int8   `gorm:"default:1" json:"status"`
}

func (Position) TableName() string { return "position" }
