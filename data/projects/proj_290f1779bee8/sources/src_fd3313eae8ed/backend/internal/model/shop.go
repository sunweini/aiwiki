package model

type Shop struct {
	BaseModel
	ParkID      int64  `gorm:"not null;index" json:"park_id"`
	Name        string `gorm:"size:100;not null" json:"name"`
	Address     string `gorm:"size:255" json:"address"`
	TypeID      int64  `gorm:"not null" json:"type_id"`
	Status      int8   `gorm:"default:1" json:"status"` // 0=closed 1=open 2=resting
	QRCodeURL   string `gorm:"size:500" json:"qr_code_url"`

	Park *Park     `gorm:"foreignKey:ParkID" json:"park,omitempty"`
	Type *ShopType `gorm:"foreignKey:TypeID" json:"type,omitempty"`
}

func (Shop) TableName() string { return "shop" }
