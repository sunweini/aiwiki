package model

type DouyinStoreMapping struct {
	BaseModel
	ShopID            int64  `gorm:"not null;index" json:"shop_id"`
	POIID             string `gorm:"size:100;not null" json:"poi_id"`
	ExternalStoreName string `gorm:"size:200" json:"external_store_name"`
	AuthStatus        int8   `gorm:"default:0" json:"auth_status"`
	SyncStatus        int8   `gorm:"default:0" json:"sync_status"`
	AccessToken       string `gorm:"size:500" json:"-"`
	TokenExpiresAt    *Time  `json:"token_expires_at"`

	Shop *Shop `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
}

func (DouyinStoreMapping) TableName() string { return "douyin_store_mapping" }

type DouyinVerifyRecord struct {
	BaseModel
	VerifyNo         string  `gorm:"uniqueIndex;size:100;not null" json:"verify_no"`
	ShopID           int64   `gorm:"not null;index" json:"shop_id"`
	CouponName       string  `gorm:"size:200" json:"coupon_name"`
	CouponType       string  `gorm:"size:20" json:"coupon_type"`
	UserPhone        string  `gorm:"size:20" json:"user_phone"`
	Amount           float64 `gorm:"type:decimal(10,2)" json:"amount"`
	Commission       float64 `gorm:"type:decimal(10,2)" json:"commission"`
	SettlementAmount float64 `gorm:"type:decimal(10,2)" json:"settlement_amount"`
	VerifiedAt       *Time   `json:"verified_at"`
	OperatorID       int64   `json:"operator_id"`

	Shop     *Shop     `gorm:"foreignKey:ShopID" json:"shop,omitempty"`
	Operator *Employee `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
}

func (DouyinVerifyRecord) TableName() string { return "douyin_verify_record" }

type DouyinSettlement struct {
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

func (DouyinSettlement) TableName() string { return "douyin_settlement" }

type DouyinApiConfig struct {
	BaseModel
	ClientKey    string `gorm:"size:100" json:"client_key"`
	ClientSecret string `gorm:"size:100" json:"-"`
	CallbackURL  string `gorm:"size:255" json:"callback_url"`
	Status       int8   `gorm:"default:0" json:"status"`
}

func (DouyinApiConfig) TableName() string { return "douyin_api_config" }
