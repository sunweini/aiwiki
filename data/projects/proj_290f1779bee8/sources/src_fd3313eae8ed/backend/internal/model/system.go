package model

type OperationLog struct {
	BaseModel
	EmployeeID int64  `gorm:"not null;index" json:"employee_id"`
	Action     string `gorm:"size:50" json:"action"`
	Module     string `gorm:"size:50" json:"module"`
	IP         string `gorm:"size:50" json:"ip"`
	Status     int8   `json:"status"`
	Detail     string `gorm:"type:json" json:"detail"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

func (OperationLog) TableName() string { return "operation_log" }

type MiniProgramConfig struct {
	BaseModel
	Type        string `gorm:"uniqueIndex;size:20;not null" json:"type"`
	AppID       string `gorm:"size:100" json:"app_id"`
	AppSecret   string `gorm:"size:100" json:"app_secret"`
	CallbackURL string `gorm:"size:255" json:"callback_url"`
	Version     string `gorm:"size:20" json:"version"`
	Status      int8   `gorm:"default:1" json:"status"`
}

func (MiniProgramConfig) TableName() string { return "mini_program_config" }
