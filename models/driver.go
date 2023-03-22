package models

type Driver struct {
	Id            int64  `json:"id" gorm:"primary_key"`
	FullName      string `json:"full_name"`
	Adress        string `json:"adress"`
	City          string `json:"city"`
	StateZip      string `json:"state_zip"`
	StateText     string `json:"state_text"`
	HomePhone     string `json:"home_phone"`
	CellPhone     string `json:"cell_phone"`
	Ss            string `json:"ss"`
	DriverLicense string `json:"driver_license"`
	Birthday      string `json:"birthday"`
	HireDate      string `json:"hire_date"`
	Comments      string `json:"comments"`
	IsActive      int    `json:"is_active"`
	Balance       int    `json:"balance"`
}

type CreateDriverInput struct {
	FullName      string `json:"full_name" binding:"required"`
	Adress        string `json:"adress" binding:"required"`
	City          string `json:"city" binding:"required"`
	StateZip      string `json:"state_zip"  binding:"required"`
	StateText     string `json:"state_text" binding:"required"`
	HomePhone     string `json:"home_phone" binding:"required"`
	CellPhone     string `json:"cell_phone" binding:"required"`
	Ss            string `json:"ss" binding:"required"`
	DriverLicense string `json:"driver_license" binding:"required"`
	Birthday      string `json:"birthday" binding:"required"`
	HireDate      string `json:"hire_date" binding:"required"`
	Comments      string `json:"comments" binding:"required"`
	IsActive      int    `json:"is_active"`
}

type UpdateDriverInput struct {
	FullName      string `json:"full_name" binding:"required"`
	Adress        string `json:"adress" binding:"required"`
	City          string `json:"city" binding:"required"`
	StateZip      string `json:"state_zip"  binding:"required"`
	StateText     string `json:"state_text" binding:"required"`
	HomePhone     string `json:"home_phone" binding:"required"`
	CellPhone     string `json:"cell_phone" binding:"required"`
	Ss            string `json:"ss" binding:"required"`
	DriverLicense string `json:"driver_license" binding:"required"`
	Birthday      string `json:"birthday" binding:"required"`
	HireDate      string `json:"hire_date" binding:"required"`
	Comments      string `json:"comments" binding:"required"`
	IsActive      int    `json:"is_active"`
	Balance       int    `json:"balance" binding:"required"`
}
