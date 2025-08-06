package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/labstack/echo/v4"
)

func RegisterRoutes(e *echo.Echo) {
	e.POST("/register", controllers.Register)
	e.POST("/login", controllers.Login)

	r := e.Group("")
	r.Use(middleware.JWTMiddleware())
	r.GET("/me", controllers.Me)
	
	// Rotas de transações
	r.GET("/transacoes", controllers.GetTransacoes)
	r.POST("/transacoes", controllers.CreateTransacao)
	r.PUT("/transacoes/:id", controllers.UpdateTransacao)
	r.DELETE("/transacoes/:id", controllers.DeleteTransacao)
	
	// Rotas do dashboard
	r.GET("/transacoes/dashboard", controllers.GetDashboard)
	r.POST("/transacoes/dashboard", controllers.SaveDashboard)
}
