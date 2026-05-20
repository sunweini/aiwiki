package model

type User struct {
	BaseModel
	Nickname         string  `gorm:"size:50" json:"nickname"`
	Phone            string  `gorm:"uniqueIndex;size:20" json:"phone"`
	OpenID           string  `gorm:"uniqueIndex;size:100" json:"openid"`
	Avatar           string  `gorm:"size:500" json:"avatar"`
	MemberLevel      string  `gorm:"size:20;default:'普通'" json:"member_level"`
	FaceStatus       int8    `gorm:"default:0" json:"face_status"`
	FaceFeatureID    string  `gorm:"size:100" json:"face_feature_id"`
	Balance          float64 `gorm:"type:decimal(10,2);default:0" json:"balance"`
	TotalConsumption float64 `gorm:"type:decimal(10,2);default:0" json:"total_consumption"`
	TotalPurchases   int     `gorm:"default:0" json:"total_purchases"`
	Points           int     `gorm:"default:0" json:"points"`
	RegisteredAt     *Time   `json:"registered_at"`
}

func (User) TableName() string { return "user" }
