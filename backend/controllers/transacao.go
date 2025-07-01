package controllers

import (
	"backend/database"
	"backend/models"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func GetTransacoes(c echo.Context) error {
	user := c.Get("user").(*models.User)
	var transacoes []models.Transacao
	database.DB.Where("user_id = ?", user.ID).Find(&transacoes)
	return c.JSON(http.StatusOK, transacoes)
}

func CreateTransacao(c echo.Context) error {
	user := c.Get("user").(*models.User)
	var t models.Transacao
	if err := c.Bind(&t); err != nil {
		return err
	}
	t.UserID = user.ID
	result := database.DB.Create(&t)
	if result.Error != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"erro": result.Error.Error()})
	}
	return c.JSON(http.StatusCreated, t)
}

func UpdateTransacao(c echo.Context) error {
	id := c.Param("id")
	var t models.Transacao
	if err := database.DB.First(&t, id).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"erro": "Transação não encontrada"})
	}
	if err := c.Bind(&t); err != nil {
		return err
	}
	database.DB.Save(&t)
	return c.JSON(http.StatusOK, t)
}

func DeleteTransacao(c echo.Context) error {
	id := c.Param("id")
	i, _ := strconv.Atoi(id)
	database.DB.Delete(&models.Transacao{}, i)
	return c.NoContent(http.StatusNoContent)
}
