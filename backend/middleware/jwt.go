package middleware

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/labstack/echo/v4"
)

func JWTMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenStr := c.Request().Header.Get("Authorization")
			id, err := utils.ParseToken(tokenStr)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Token inválido"})
			}
			var user models.User
			database.DB.First(&user, id)
			if user.ID == 0 {
				return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Usuário não encontrado"})
			}
			c.Set("user", &user)
			return next(c)
		}
	}
}
