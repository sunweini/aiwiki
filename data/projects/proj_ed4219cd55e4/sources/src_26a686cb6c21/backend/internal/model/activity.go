package model

type Activity struct {
	BaseModel
	Title            string  `gorm:"size:200;not null" json:"title"`
	CoverURL         string  `gorm:"size:500" json:"cover_url"`
	Content          string  `gorm:"type:text" json:"content"`
	Type             string  `gorm:"size:20" json:"type"`
	StartAt          *Time   `json:"start_at"`
	EndAt            *Time   `json:"end_at"`
	ApplicableParks  string  `gorm:"size:500" json:"applicable_parks"`
	ApplicableShops  string  `gorm:"size:500" json:"applicable_shops"`
	Status           int8    `gorm:"default:0" json:"status"`
	ExposureCount    int     `gorm:"default:0" json:"exposure_count"`
	ParticipantCount int     `gorm:"default:0" json:"participant_count"`
	ConversionOrders int     `gorm:"default:0" json:"conversion_orders"`
	VerificationRate float64 `gorm:"type:decimal(5,2)" json:"verification_rate"`
	CreatedBy        int64   `json:"created_by"`

	Creator *Employee `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

func (Activity) TableName() string { return "activity" }
