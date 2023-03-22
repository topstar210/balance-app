package models

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func ConnectDatabase() error {
	db, err := sql.Open("sqlite3", "names.db")
	if err != nil {
		return err
	}

	DB = db
	return nil
}