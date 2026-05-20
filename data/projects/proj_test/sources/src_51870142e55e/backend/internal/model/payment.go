package model

type PaymentConfig struct {
	BaseModel
	ShopID      int64  `gorm:"not null;index" json:"shop_id"`
	Platform    string `gorm:"size:20;not null" json:"platform"`
	AppID       string `gorm:"size:100" json:"app_id"`
	AppSecret   string `gorm:"size:100" json:"-"`
	MerchantID  string `gorm:"size:100" json:"merchant_id"`
	SignKey     string `gorm:"size:255" json:"-"`
	PrivateKey  string `gorm:"type:text" json:"-"`
	PublicKey   string `gorm:"type:text" json:"-"`
	NotifyURL   string `gorm:"size:255" json:"notify_url"`
	Status      int8   `gorm:"default:0" json:"status"`

	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (PaymentConfig) TableName() string { return "payment_config" }
