package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"

	"backend/database"
	"backend/models"
	"backend/routes"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Inicializa DB
	database.Connect()

	// Força recriação do usuário admin
	database.DB.Where("username = ?", "admin").Delete(&models.User{})
	hash, _ := bcrypt.GenerateFromPassword([]byte("123456"), 14)
	database.DB.Create(&models.User{
		Nome:     "Admin",
		Username: "admin",
		Senha:    string(hash),
	})
	fmt.Println("✅ Usuário padrão recriado: admin / 123456")

	// Rotas
	routes.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":3000"))
}
