package models

type Transaction struct {
	Id int64 `json:"id" gorm:"primary_key"`
	DriverId int64 `json:"driver_id"`
	Date string `json:"date"`
	Trans int `json:"trans"`
	Comments string `json:"comments"`
	Balance int `json:"balance"`
}

type CreateTransactionInput struct {
	DriverId int64 `json:"driver_id" binding:"required"`
	Date string `json:"date" binding:"required"`
	Trans int `json:"trans" binding:"required"`
	Comments string `json:"comments"`
}

type UpdateTransactionInput struct {
	Id int64 `json:"id" gorm:"primary_key"`
	DriverId int64 `json:"driver_id" binding:"required"`
	Date string `json:"date" binding:"required"`
	Trans int `json:"trans" binding:"required"`
	Comments string `json:"comments"`
	Different int `json:"different"`
	Balance int `json:"balance"`
}

type DeleteTransactionInput struct {
	Id int64 `json:"id" gorm:"primary_key"`
	DriverId int64 `json:"driver_id" binding:"required"`
	Trans int `json:"trans" binding:"required"`
}