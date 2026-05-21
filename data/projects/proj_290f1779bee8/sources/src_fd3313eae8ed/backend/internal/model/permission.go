package model

type Permission struct {
	BaseModel
	Module string `gorm:"size:50;not null" json:"module"`
	Action string `gorm:"size:20;not null" json:"action"` // view/edit/create/delete
	Label  string `gorm:"size:100" json:"label"`
}

func (Permission) TableName() string { return "permission" }
