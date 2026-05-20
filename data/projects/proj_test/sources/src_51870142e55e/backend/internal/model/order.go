package model

type Order struct {
	BaseModel
	OrderNo       string  `gorm:"uniqueIndex;size:100;not null" json:"order_no"`
	UserID        int64   `gorm:"not null;index" json:"user_id"`
	ShopID        int64   `gorm:"not null;index" json:"shop_id"`
	Amount        float64 `gorm:"type:decimal(10,2);not null" json:"amount"`
	PaymentMethod string  `gorm:"size:20" json:"payment_method"`
	Status        string  `gorm:"size:20" json:"status"`
	Remark        string  `gorm:"size:500" json:"remark"`
	PaidAt        *Time   `json:"paid_at"`
	VerifiedAt    *Time   `json:"verified_at"`
	CancelledAt   *Time   `json:"cancelled_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (Order) TableName() string { return "order" }
