package model

type RefundRecord struct {
	BaseModel
	OrderID    int64   `gorm:"not null;index" json:"order_id"`
	UserID     int64   `gorm:"not null;index" json:"user_id"`
	Amount     float64 `gorm:"type:decimal(10,2);not null" json:"amount"`
	Reason     string  `gorm:"size:500" json:"reason"`
	Status     string  `gorm:"size:20" json:"status"`
	ReviewerID *int64  `json:"reviewer_id"`
	ReviewNote string  `gorm:"size:500" json:"review_note"`
	ReviewedAt *Time   `json:"reviewed_at"`
	RefundedAt *Time   `json:"refunded_at"`

	Order    *Order    `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	User     *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Reviewer *Employee `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
}

func (RefundRecord) TableName() string { return "refund_record" }
