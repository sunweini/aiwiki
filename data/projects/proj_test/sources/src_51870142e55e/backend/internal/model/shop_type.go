package model

type ShopType struct {
	BaseModel
	Name        string `gorm:"uniqueIndex;size:50;not null" json:"name"`
	Code        string `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Description string `gorm:"size:255" json:"description"`
	Status      int8   `gorm:"default:1" json:"status"`
}

func (ShopType) TableName() string { return "shop_type" }
