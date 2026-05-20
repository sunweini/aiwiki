package model

type GateDevice struct {
	BaseModel
	ParkID    int64  `gorm:"not null;index" json:"park_id"`
	Name      string `gorm:"size:100;not null" json:"name"`
	Type      string `gorm:"size:20" json:"type"`
	Direction string `gorm:"size:10" json:"direction"`
	DeviceSN  string `gorm:"size:50" json:"device_sn"`
	Status    int8   `gorm:"default:1" json:"status"`

	Park *Park `gorm:"foreignKey:ParkID" json:"park,omitempty"`
}

func (GateDevice) TableName() string { return "gate_device" }

type GateEntryRecord struct {
	BaseModel
	UserID       int64   `gorm:"not null;index" json:"user_id"`
	GateID       int64   `gorm:"not null;index" json:"gate_id"`
	Direction    string  `gorm:"size:10" json:"direction"`
	Similarity   float64 `gorm:"type:decimal(5,2)" json:"similarity"`
	VerifyMethod string  `gorm:"size:10" json:"verify_method"`
	EntryTime    *Time   `json:"entry_time"`

	User *User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Gate *GateDevice `gorm:"foreignKey:GateID" json:"gate,omitempty"`
}

func (GateEntryRecord) TableName() string { return "gate_entry_record" }

// FaceRecord 已录入人脸的用户记录模型
type FaceRecord struct {
	BaseModel
	UserID      int64  `gorm:"not null;index;unique" json:"user_id"`
	FeatureID   string `gorm:"size:128" json:"feature_id"`
	GateAccess  string `gorm:"size:20;default:all" json:"gate_access"`
	Status      int8   `gorm:"default:1" json:"status"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (FaceRecord) TableName() string { return "face_record" }
