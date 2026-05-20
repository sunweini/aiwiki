package model

type RechargeRecord struct {
	BaseModel
	UserID        int64   `gorm:"not null;index" json:"user_id"`
	Amount        float64 `gorm:"type:decimal(10,2);not null" json:"amount"`
	BonusAmount   float64 `gorm:"type:decimal(10,2);default:0" json:"bonus_amount"`
	Status        string  `gorm:"size:20" json:"status"`
	PaymentMethod string  `gorm:"size:20" json:"payment_method"`
	TransactionNo string  `gorm:"size:100" json:"transaction_no"`
	Remark        string  `gorm:"size:500" json:"remark"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (RechargeRecord) TableName() string { return "recharge_record" }
