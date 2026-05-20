package model

type MeituanStoreMapping struct {
	BaseModel
	ShopID            int64  `gorm:"not null;index" json:"shop_id"`
	ExternalStoreID   string `gorm:"size:100;not null" json:"external_store_id"`
	ExternalStoreName string `gorm:"size:200" json:"external_store_name"`
	AuthStatus        int8   `gorm:"default:0" json:"auth_status"`
	SyncStatus        int8   `gorm:"default:0" json:"sync_status"`
	AccessToken       string `gorm:"size:500" json:"-"`
	TokenExpiresAt    *Time  `json:"token_expires_at"`

	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (MeituanStoreMapping) TableName() string { return "meituan_store_mapping" }

type MeituanVerifyRecord struct {
	BaseModel
	VerifyNo         string  `gorm:"uniqueIndex;size:100;not null" json:"verify_no"`
	ShopID           int64   `gorm:"not null;index" json:"shop_id"`
	CouponName       string  `gorm:"size:200" json:"coupon_name"`
	UserPhone        string  `gorm:"size:20" json:"user_phone"`
	Amount           float64 `gorm:"type:decimal(10,2)" json:"amount"`
	Commission       float64 `gorm:"type:decimal(10,2)" json:"commission"`
	SettlementAmount float64 `gorm:"type:decimal(10,2)" json:"settlement_amount"`
	VerifiedAt       *Time   `json:"verified_at"`
	OperatorID       int64   `json:"operator_id"`

	Shop     *Shop     `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	Operator *Employee `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
}

func (MeituanVerifyRecord) TableName() string { return "meituan_verify_record" }

type MeituanSettlement struct {
	BaseModel
	BatchNo          string  `gorm:"uniqueIndex;size:100;not null" json:"batch_no"`
	ShopID           int64   `gorm:"not null;index" json:"shop_id"`
	VerifyCount      int     `json:"verify_count"`
	VerifyTotal      float64 `gorm:"type:decimal(10,2)" json:"verify_total"`
	CommissionTotal  float64 `gorm:"type:decimal(10,2)" json:"commission_total"`
	SettlementAmount float64 `gorm:"type:decimal(10,2)" json:"settlement_amount"`
	Status           string  `gorm:"size:20" json:"status"`
	SettlementDate   *Time   `json:"settlement_date"`

	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (MeituanSettlement) TableName() string { return "meituan_settlement" }

type MeituanApiConfig struct {
	BaseModel
	AppID       string `gorm:"size:100" json:"app_id"`
	AppSecret   string `gorm:"size:100" json:"-"`
	CallbackURL string `gorm:"size:255" json:"callback_url"`
	Status      int8   `gorm:"default:0" json:"status"`
}

func (MeituanApiConfig) TableName() string { return "meituan_api_config" }
