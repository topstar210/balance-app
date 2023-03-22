package controllers

import (
	"fmt"
	"net/http"

	"demo.com/balance/models"
	"github.com/gin-gonic/gin"
)

// GET /drivers
// Get all driver
func GetDrivers(c *gin.Context) {
	// rows, err := models.DB.Query("select * from drivers order by id desc limit $1", c.Query("count"))
	rows, err := models.DB.Query("select * from drivers order by id desc")
	if err != nil {
		panic(err)
	}
	defer rows.Close()
	drivers := []models.Driver{}

	for rows.Next() {
		singleDriver := models.Driver{}
		err := rows.Scan(&singleDriver.Id, &singleDriver.FullName, &singleDriver.Adress, &singleDriver.City, &singleDriver.StateZip, &singleDriver.StateText, &singleDriver.HomePhone, &singleDriver.CellPhone, &singleDriver.Ss, &singleDriver.DriverLicense, &singleDriver.Birthday, &singleDriver.HireDate, &singleDriver.Comments, &singleDriver.IsActive, &singleDriver.Balance)
		if err != nil {
			fmt.Println(err)
			continue
		}
		drivers = append(drivers, singleDriver)
	}

	// get reversed
	rows, err = models.DB.Query("select * from drivers order by id asc limit 1")

	if err != nil {
		panic(err)
	}
	defer rows.Close()
	newDrivers := []models.Driver{}

	for rows.Next() {
		singleDriver := models.Driver{}
		err := rows.Scan(&singleDriver.Id, &singleDriver.FullName, &singleDriver.Adress, &singleDriver.City, &singleDriver.StateZip, &singleDriver.StateText, &singleDriver.HomePhone, &singleDriver.CellPhone, &singleDriver.Ss, &singleDriver.DriverLicense, &singleDriver.Birthday, &singleDriver.HireDate, &singleDriver.Comments, &singleDriver.IsActive, &singleDriver.Balance)
		if err != nil {
			fmt.Println(err)
			continue
		}
		newDrivers = append(drivers, singleDriver)
	}

	c.JSON(http.StatusOK, gin.H{"data": drivers, "last_driver_id": newDrivers[len(newDrivers)-1:][0].Id})

}

// POST /drivers
// Create new driver
func CreateDriver(c *gin.Context) {
	var input models.CreateDriverInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := models.DB.Exec("insert into drivers (full_name, adress, city, state_zip, state_text, home_phone, cell_phone, ss, driver_license, birthday, hire_date, comments, is_active, balance) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0)",
		input.FullName, input.Adress, input.City, input.StateZip, input.StateText, input.HomePhone, input.CellPhone, input.Ss, input.DriverLicense, input.Birthday, input.HireDate, input.Comments, input.IsActive)
	if err != nil {
		panic(err)
	}

	var resultDriver models.Driver
	id, err := result.LastInsertId()
	if err != nil {
		println("Error:", err.Error())
	} else {
		resultDriver.Id = id
	}
	resultDriver.FullName = input.FullName
	resultDriver.Adress = input.Adress
	resultDriver.City = input.City
	resultDriver.StateZip = input.StateZip
	resultDriver.StateText = input.StateText
	resultDriver.HomePhone = input.HomePhone
	resultDriver.CellPhone = input.CellPhone
	resultDriver.Ss = input.Ss
	resultDriver.DriverLicense = input.DriverLicense
	resultDriver.Birthday = input.Birthday
	resultDriver.HireDate = input.HireDate
	resultDriver.Comments = input.Comments
	resultDriver.IsActive = input.IsActive
	resultDriver.Balance = 0

	c.JSON(http.StatusOK, gin.H{"data": resultDriver})
}

// GET /drivers/:id
// Find a driver
func FindDriver(c *gin.Context) { // Get model if exist
	var singleDriver models.Driver

	stmt, err := models.DB.Prepare("SELECT * from drivers WHERE id = ?")

	if err != nil {
		panic(err)
	}

	sqlErr := stmt.QueryRow(c.Param("id")).Scan(&singleDriver.Id, &singleDriver.FullName, &singleDriver.Adress, &singleDriver.City, &singleDriver.StateZip, &singleDriver.StateText, &singleDriver.HomePhone, &singleDriver.CellPhone, &singleDriver.Ss, &singleDriver.DriverLicense, &singleDriver.Birthday, &singleDriver.HireDate, &singleDriver.Comments, &singleDriver.IsActive, &singleDriver.Balance)

	if sqlErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
	} else {
		c.JSON(http.StatusOK, gin.H{"data": singleDriver})
	}

}

// PATCH /drivers/
// Update a driver
func UpdateDriver(c *gin.Context) {
	var input models.Driver

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// обновляем строку с id
	result, err := models.DB.Exec("update drivers set full_name = $1, adress = $2, city = $3, state_zip = $4, state_text = $5, home_phone = $6, cell_phone = $7, ss = $8, driver_license = $9, birthday = $10, hire_date = $11, comments = $12, is_active = $13, balance = $14 where id = $15",
		input.FullName, input.Adress, input.City, input.StateZip, input.StateText, input.HomePhone, input.CellPhone, input.Ss, input.DriverLicense, input.Birthday, input.HireDate, input.Comments, input.IsActive, input.Balance, input.Id)
	fmt.Println(input.Id)

	if err != nil {
		panic(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println(result)
	}
	var resultDriver models.Driver
	resultDriver.Id = input.Id
	resultDriver.FullName = input.FullName
	resultDriver.Adress = input.Adress
	resultDriver.City = input.City
	resultDriver.StateZip = input.StateZip
	resultDriver.StateText = input.StateText
	resultDriver.HomePhone = input.HomePhone
	resultDriver.CellPhone = input.CellPhone
	resultDriver.Ss = input.Ss
	resultDriver.DriverLicense = input.DriverLicense
	resultDriver.Birthday = input.Birthday
	resultDriver.HireDate = input.HireDate
	resultDriver.Comments = input.Comments
	resultDriver.IsActive = input.IsActive
	resultDriver.Balance = input.Balance

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// DELETE /drivers/:id
// Delete a driver
func DeleteDriver(c *gin.Context) {
	// удаляем строку с id
	result, err := models.DB.Exec("delete from drivers where id = $1", c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
		fmt.Println(err)
	} else {
		c.JSON(http.StatusOK, gin.H{"data": true})
		fmt.Println(result)
	}
}
