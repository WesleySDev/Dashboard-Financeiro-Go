package middleware

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

func JWTMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenStr := c.Request().Header.Get("Authorization")
			
			// Log para debug
			fmt.Printf("Token recebido: %s\n", tokenStr)
			
			// Remove o prefixo "Bearer " se existir
			if len(tokenStr) > 7 && tokenStr[:7] == "Bearer " {
				tokenStr = tokenStr[7:]
				fmt.Printf("Token após remover Bearer: %s\n", tokenStr)
			}
			
			id, err := utils.ParseToken(tokenStr)
			if err != nil {
				fmt.Printf("Erro ao analisar token: %v\n", err)
				return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Token inválido"})
			}
			
			fmt.Printf("ID do usuário extraído do token: %d\n", id)
			
			var user models.User
			result := database.DB.First(&user, id)
			if result.Error != nil {
				fmt.Printf("Erro ao buscar usuário: %v\n", result.Error)
				return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Usuário não encontrado"})
			}
			
			if user.ID == 0 {
				fmt.Println("ID do usuário é zero")
				return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Usuário não encontrado"})
			}
			
			fmt.Printf("Usuário encontrado: %s (ID: %d)\n", user.Username, user.ID)
			c.Set("user", &user)
			return next(c)
		}
	}
}
