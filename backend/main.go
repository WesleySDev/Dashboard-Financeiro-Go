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
	// Criar usuário padrão se não existir
	var user models.User
	database.DB.First(&user, "email = ?", "admin@admin.com")
	if user.ID == 0 {
		hash, _ := bcrypt.GenerateFromPassword([]byte("123456"), 14)
		database.DB.Create(&models.User{
			Nome:  "Admin",
			Email: "admin@admin.com",
			Senha: string(hash),
		})
		fmt.Println("✅ Usuário padrão criado: admin@admin.com / 123456")
	}

	// Rotas
	routes.RegisterRoutes(e)

	e.Logger.Fatal(e.Start(":3000"))
}
