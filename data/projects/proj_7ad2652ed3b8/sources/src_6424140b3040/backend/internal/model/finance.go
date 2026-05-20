package model

type WithdrawApplication struct {
	BaseModel
	ShopID      int64   `gorm:"not null;index" json:"shop_id"`
	Amount      float64 `gorm:"type:decimal(10,2);not null" json:"amount"`
	BankName    string  `gorm:"size:50" json:"bank_name"`
	BankAccount string  `gorm:"size:100" json:"bank_account"`
	AccountName string  `gorm:"size:50" json:"account_name"`
	Status      string  `gorm:"size:20" json:"status"`
	ReviewerID  *int64  `json:"reviewer_id"`
	ReviewNote  string  `gorm:"size:500" json:"review_note"`
	ReviewedAt  *Time   `json:"reviewed_at"`
	PaidAt      *Time   `json:"paid_at"`

	Shop     *Shop     `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	Reviewer *Employee `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
}

func (WithdrawApplication) TableName() string { return "withdraw_application" }

type Reconciliation struct {
	BaseModel
	ParkID         int64   `gorm:"not null;index" json:"park_id"`
	ShopID         *int64  `gorm:"index" json:"shop_id"`
	Date           Time    `gorm:"type:date;not null" json:"date"`
	TotalAmount    float64 `gorm:"type:decimal(10,2)" json:"total_amount"`
	OrderCount     int     `json:"order_count"`
	OnlineAmount   float64 `gorm:"type:decimal(10,2)" json:"online_amount"`
	OfflineAmount  float64 `gorm:"type:decimal(10,2)" json:"offline_amount"`
	MeituanAmount  float64 `gorm:"type:decimal(10,2)" json:"meituan_amount"`
	DouyinAmount   float64 `gorm:"type:decimal(10,2)" json:"douyin_amount"`
	RechargeAmount float64 `gorm:"type:decimal(10,2)" json:"recharge_amount"`
	WithdrawAmount float64 `gorm:"type:decimal(10,2)" json:"withdraw_amount"`

	Park *Park `gorm:"foreignKey:ParkID" json:"park,omitempty"`
	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (Reconciliation) TableName() string { return "reconciliation" }
