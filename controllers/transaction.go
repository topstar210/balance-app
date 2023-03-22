package controllers

import (
"demo.com/balance/models"
"github.com/gin-gonic/gin"
"net/http"
"fmt"
)

// GET /transactions/:id

// Get transactions by driver id
func GetTransactions(c *gin.Context) {
	rows, err := models.DB.Query("select * from transactions where driver_id = $1 ORDER BY id DESC;", c.Param("id"))

  if err != nil {
      panic(err)
  }
  defer rows.Close()
  transactions := []models.Transaction{}
   
  for rows.Next(){
      singleTransaction := models.Transaction{}
      err := rows.Scan(&singleTransaction.Id, &singleTransaction.DriverId, &singleTransaction.Date, &singleTransaction.Trans, &singleTransaction.Comments, &singleTransaction.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }

      fmt.Println("Single Row", singleTransaction)
      transactions = append(transactions, singleTransaction)
  }

  c.JSON(http.StatusOK, gin.H{"data": transactions})
}


// POST /transactions
// Create new transaction
func CreateTransaction(c *gin.Context) {
	var input models.CreateTransactionInput

  if err := c.ShouldBindJSON(&input); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }

  // get result balance
  var resultBalance int
  var singleDriver models.Driver
  
  stmt, err := models.DB.Prepare("SELECT * from drivers WHERE id = ?")

	if err != nil {
    panic(err)
	}

	sqlErr := stmt.QueryRow(input.DriverId).Scan(&singleDriver.Id, &singleDriver.FullName, &singleDriver.Adress, &singleDriver.City, &singleDriver.StateZip, &singleDriver.StateText, &singleDriver.HomePhone, &singleDriver.CellPhone, &singleDriver.Ss, &singleDriver.DriverLicense, &singleDriver.Birthday, &singleDriver.HireDate, &singleDriver.Comments, &singleDriver.IsActive, &singleDriver.Balance)

	if sqlErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
    return
	}

  resultBalance = singleDriver.Balance + input.Trans

  // set new balance to driver
  result, err := models.DB.Exec("update drivers set full_name = $1, adress = $2, city = $3, state_zip = $4, state_text = $5, home_phone = $6, cell_phone = $7, ss = $8, driver_license = $9, birthday = $10, hire_date = $11, comments = $12, is_active = $13, balance = $14 where id = $15", 
  singleDriver.FullName, singleDriver.Adress,singleDriver.City,singleDriver.StateZip,singleDriver.StateText,singleDriver.HomePhone,singleDriver.CellPhone,singleDriver.Ss,singleDriver.DriverLicense,singleDriver.Birthday,singleDriver.HireDate,singleDriver.Comments,singleDriver.IsActive, resultBalance, input.DriverId)
  if err != nil{
    fmt.Println(result)
    panic(err)
  }


  fmt.Println(singleDriver.Balance)
  fmt.Println(input.Trans)
  fmt.Println(resultBalance)
  
  result, err = models.DB.Exec("insert into transactions (driver_id, date, comments, balance, trans) values ($1, $2, $3, $4, $5)", 
  input.DriverId, input.Date, input.Comments, resultBalance, input.Trans)

  if err != nil{
    c.JSON(http.StatusBadRequest, gin.H{"error": err})
      panic(err)
      
  }


  var resultTransaction models.Transaction
  id, err := result.LastInsertId()
        if err != nil {
          println("Error:", err.Error())
        } else {
          resultTransaction.Id = id
        }
  resultTransaction.DriverId = input.DriverId
  resultTransaction.Date = input.Date
  resultTransaction.Trans = input.Trans
  resultTransaction.Comments = input.Comments
  resultTransaction.Balance = resultBalance

  c.JSON(http.StatusOK, gin.H{"data": resultTransaction})
}


// PATCH /transactions/
// Update a transaction
func UpdateTransaction(c *gin.Context) {
  var input models.UpdateTransactionInput
  

  if err := c.ShouldBindJSON(&input); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }

  // обновляем строку с id
  result, err := models.DB.Exec("update transactions set driver_id = $1, date = $2, trans = $3, comments = $4, balance = $5 where id = $6", 
  input.DriverId, input.Date, input.Trans, input.Comments, input.Balance, input.Id)
  
  if err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
      panic(err)
  }


  // Update transactions after current
  rows, err := models.DB.Query("select * from transactions where driver_id = $1 and id > $2", input.DriverId, input.Id)

  if err != nil {
      panic(err)
  }
  defer rows.Close()

  transactions := []models.Transaction{}

  for rows.Next(){
      singleTransaction := models.Transaction{}
      fmt.Println(singleTransaction)
      err := rows.Scan(&singleTransaction.Id, &singleTransaction.DriverId, &singleTransaction.Date, &singleTransaction.Trans, &singleTransaction.Comments, &singleTransaction.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }

      transactions = append(transactions, singleTransaction)
  }

  fmt.Println(transactions)

  for i := 0; i < len(transactions); i++ {
		singleTransaction := transactions[i]

    // Now update each transaction after current (balance = balance - different)
    result, err := models.DB.Exec("update transactions set driver_id = $1, date = $2, trans = $3, comments = $4, balance = $5 where id = $6", 
    singleTransaction.DriverId, singleTransaction.Date, singleTransaction.Trans, singleTransaction.Comments, singleTransaction.Balance - input.Different, singleTransaction.Id)
    
    fmt.Println(singleTransaction.Balance - input.Different)
    
    if err != nil {
        panic(err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println(result)
    }
	}

  
  // Set new balance to driver from last transaction
  rows, err = models.DB.Query("select * from drivers where id = $1", input.DriverId)

  if err != nil {
      panic(err)
  }
  defer rows.Close()
  drivers := []models.Driver{}
   
  for rows.Next(){
      singleDriver := models.Driver{}
      err := rows.Scan(&singleDriver.Id, &singleDriver.FullName, &singleDriver.Adress, &singleDriver.City, &singleDriver.StateZip, &singleDriver.StateText, &singleDriver.HomePhone, &singleDriver.CellPhone, &singleDriver.Ss, &singleDriver.DriverLicense, &singleDriver.Birthday, &singleDriver.HireDate, &singleDriver.Comments, &singleDriver.IsActive, &singleDriver.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }
      drivers = append(drivers, singleDriver)
  }

  singleDriver := drivers[0]
  
  
  rows, err = models.DB.Query("select * from transactions where driver_id = $1 ORDER BY id DESC LIMIT 1;", input.DriverId)

  if err != nil {
      panic(err)
  }
  defer rows.Close()
  lastTransactions := []models.Transaction{}
   
  for rows.Next(){
      singleTransaction := models.Transaction{}
      err := rows.Scan(&singleTransaction.Id, &singleTransaction.DriverId, &singleTransaction.Date, &singleTransaction.Trans, &singleTransaction.Comments, &singleTransaction.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }
      lastTransactions = append(transactions, singleTransaction)
  }

  lastTransaction := lastTransactions[0]

  // обновляем драйвера
  result, err = models.DB.Exec("update drivers set full_name = $1, adress = $2, city = $3, state_zip = $4, state_text = $5, home_phone = $6, cell_phone = $7, ss = $8, driver_license = $9, birthday = $10, hire_date = $11, comments = $12, is_active = $13, balance = $14 where id = $15", 
  singleDriver.FullName, singleDriver.Adress,singleDriver.City,singleDriver.StateZip,singleDriver.StateText,singleDriver.HomePhone,singleDriver.CellPhone,singleDriver.Ss,singleDriver.DriverLicense,singleDriver.Birthday,singleDriver.HireDate,singleDriver.Comments,singleDriver.IsActive,singleDriver.Balance - input.Different, singleDriver.Id)
  fmt.Println(input.Id)
  
  if err != nil {
      panic(err)
      c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
      fmt.Println(result)
  }


  fmt.Println(lastTransaction)
  fmt.Println(singleDriver)

  

  var resultTrans models.Transaction
  resultTrans.Id = input.Id
  resultTrans.DriverId = input.DriverId
  resultTrans.Date = input.Date
  resultTrans.Trans = input.Trans
  resultTrans.Comments = input.Comments
  resultTrans.Balance = input.Balance

  c.JSON(http.StatusOK, gin.H{"data": resultTrans})
}


// POST /transactions/delete
// Delete a transaction
func DeleteTransaction(c *gin.Context) {
  var input models.DeleteTransactionInput
  

  if err := c.ShouldBindJSON(&input); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }

  // Update transactions after current
  rows, err := models.DB.Query("select * from transactions where driver_id = $1 and id > $2", input.DriverId, input.Id)

  if err != nil {
      panic(err)
  }
  defer rows.Close()

  transactions := []models.Transaction{}

  for rows.Next(){
      singleTransaction := models.Transaction{}
      fmt.Println(singleTransaction)
      err := rows.Scan(&singleTransaction.Id, &singleTransaction.DriverId, &singleTransaction.Date, &singleTransaction.Trans, &singleTransaction.Comments, &singleTransaction.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }

      transactions = append(transactions, singleTransaction)
  }

  fmt.Println(transactions)

  for i := 0; i < len(transactions); i++ {
		singleTransaction := transactions[i]

    // Now update each transaction after current (balance = balance - trans)
    result, err := models.DB.Exec("update transactions set driver_id = $1, date = $2, trans = $3, comments = $4, balance = $5 where id = $6", 
    singleTransaction.DriverId, singleTransaction.Date, singleTransaction.Trans, singleTransaction.Comments, singleTransaction.Balance - input.Trans, singleTransaction.Id)
    
    fmt.Println(singleTransaction.Balance - input.Trans)
    
    if err != nil {
        panic(err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println(result)
    }
	}

  
  // Set new balance to driver from last transaction
  rows, err = models.DB.Query("select * from drivers where id = $1", input.DriverId)

  if err != nil {
      panic(err)
  }
  defer rows.Close()
  drivers := []models.Driver{}
   
  for rows.Next(){
      singleDriver := models.Driver{}
      err := rows.Scan(&singleDriver.Id, &singleDriver.FullName, &singleDriver.Adress, &singleDriver.City, &singleDriver.StateZip, &singleDriver.StateText, &singleDriver.HomePhone, &singleDriver.CellPhone, &singleDriver.Ss, &singleDriver.DriverLicense, &singleDriver.Birthday, &singleDriver.HireDate, &singleDriver.Comments, &singleDriver.IsActive, &singleDriver.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }
      drivers = append(drivers, singleDriver)
  }

  singleDriver := drivers[0]
  
  
  rows, err = models.DB.Query("select * from transactions where driver_id = $1 ORDER BY id DESC LIMIT 1;", input.DriverId)

  if err != nil {
      panic(err)
  }
  defer rows.Close()
  lastTransactions := []models.Transaction{}
   
  for rows.Next(){
      singleTransaction := models.Transaction{}
      err := rows.Scan(&singleTransaction.Id, &singleTransaction.DriverId, &singleTransaction.Date, &singleTransaction.Trans, &singleTransaction.Comments, &singleTransaction.Balance)
      if err != nil{
          fmt.Println(err)
          continue
      }
      lastTransactions = append(transactions, singleTransaction)
  }

  lastTransaction := lastTransactions[0]

  // обновляем драйвера
  result, err := models.DB.Exec("update drivers set full_name = $1, adress = $2, city = $3, state_zip = $4, state_text = $5, home_phone = $6, cell_phone = $7, ss = $8, driver_license = $9, birthday = $10, hire_date = $11, comments = $12, is_active = $13, balance = $14 where id = $15", 
  singleDriver.FullName, singleDriver.Adress,singleDriver.City,singleDriver.StateZip,singleDriver.StateText,singleDriver.HomePhone,singleDriver.CellPhone,singleDriver.Ss,singleDriver.DriverLicense,singleDriver.Birthday,singleDriver.HireDate,singleDriver.Comments,singleDriver.IsActive,singleDriver.Balance - input.Trans, singleDriver.Id)
  fmt.Println(input.Id)
  
  if err != nil {
      panic(err)
      c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
      fmt.Println(result)
  }


  fmt.Println(lastTransaction)
  fmt.Println(singleDriver)


  // удаляем строку с id
  result, err = models.DB.Exec("delete from transactions where id = $1", input.Id)
  if err != nil{
    c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
    fmt.Println(err)
  } else {
    c.JSON(http.StatusOK, gin.H{"data": true})
    fmt.Println(result)
  }
}