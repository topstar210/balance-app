package main

import (
	"net/http"
	"time"

	"demo.com/balance/controllers"
	"demo.com/balance/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	models.ConnectDatabase()

	r := gin.Default()

	r.Use(cors.Default())

	// views load
	r.LoadHTMLGlob("views/*")
	r.Static("/assets", "./assets")

	r.GET("/drivers", func(c *gin.Context) {
		currentTime := time.Now()
		c.HTML(http.StatusOK, "drivers.html", gin.H{
			"title":    "Drivers",
			"currDate": currentTime.Format("2006-01-02"),
		})
	})
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "enterpwd.html", gin.H{
			"title": "enter password",
		})
	})

	// API v1
	v1 := r.Group("/api/v1")
	{
		// Transactions
		v1.GET("transactions/:id", controllers.GetTransactions)
		v1.POST("transactions", controllers.CreateTransaction)
		v1.PATCH("transactions", controllers.UpdateTransaction)
		v1.POST("transactions/delete", controllers.DeleteTransaction)

		// Drivers
		v1.GET("drivers", controllers.GetDrivers)
		v1.POST("drivers", controllers.CreateDriver)
		v1.GET("/drivers/:id", controllers.FindDriver)
		v1.PATCH("/drivers", controllers.UpdateDriver)
		v1.DELETE("/drivers/:id", controllers.DeleteDriver)
	}

	r.Run()
}
