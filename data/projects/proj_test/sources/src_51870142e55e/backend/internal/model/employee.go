package model

type Employee struct {
	BaseModel
	Username     string `gorm:"uniqueIndex;size:50;not null" json:"username"`
	PasswordHash string `gorm:"size:255;not null" json:"-"`
	RealName     string `gorm:"size:50" json:"real_name"`
	Phone        string `gorm:"size:20" json:"phone"`
	Gender       int8   `gorm:"default:0" json:"gender"` // 0=unknown 1=male 2=female
	ParkID       *int64 `json:"park_id"`
	ShopID       *int64 `json:"shop_id"`
	Role         string `gorm:"size:50;not null" json:"role"`
	Position     string `gorm:"size:100" json:"position"`
	Status       int8   `gorm:"default:1" json:"status"` // 0=disabled 1=enabled
	OnlineStatus int8   `gorm:"default:0" json:"online_status"`

	Park *Park `gorm:"foreignKey:ParkID" json:"park,omitempty"`
	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (Employee) TableName() string { return "employee" }
