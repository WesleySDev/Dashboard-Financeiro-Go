package controllers

import (
	"backend/database"
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func Register(c echo.Context) error {
	var user models.User
	if err := c.Bind(&user); err != nil {
		return err
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(user.Senha), 14)
	user.Senha = string(hash)
	result := database.DB.Create(&user)
	if result.Error != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"erro": result.Error.Error()})
	}
	return c.JSON(http.StatusCreated, user)
}

func Login(c echo.Context) error {
	var body struct {
		Username string `json:"username"`
		Senha    string `json:"senha"`
	}

	if err := c.Bind(&body); err != nil {
		return err
	}
	var user models.User
	result := database.DB.First(&user, "username = ?", body.Username)
	if result.Error != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Credenciais inválidas"})
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Senha), []byte(body.Senha)); err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{"erro": "Senha incorreta"})
	}
	token, err := utils.GenerateJWT(user.ID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"erro": "Erro ao gerar token"})
	}
	return c.JSON(http.StatusOK, echo.Map{"token": token})
}

func Me(c echo.Context) error {
	user := c.Get("user").(*models.User)
	return c.JSON(http.StatusOK, user)
}
