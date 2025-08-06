package controllers

import (
	"backend/database"
	"backend/models"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
)

func GetDashboard(c echo.Context) error {
	user := c.Get("user").(*models.User)
	var dashboard models.Dashboard
	result := database.DB.Where("user_id = ?", user.ID).First(&dashboard)

	if result.Error != nil {
		// Se não encontrar, retorna um dashboard vazio
		return c.JSON(http.StatusOK, echo.Map{
			"salario": 0,
			"gasto":   0,
			"custo":   0,
			"gastos":  []string{},
		})
	}

	// Converter a string JSON de gastos para array
	var gastos []string
	if dashboard.Gastos != "" {
		if err := json.Unmarshal([]byte(dashboard.Gastos), &gastos); err != nil {
			gastos = []string{}
		}
	}

	return c.JSON(http.StatusOK, echo.Map{
		"salario": dashboard.Salario,
		"gasto":   dashboard.Gasto,
		"custo":   dashboard.Custo,
		"gastos":  gastos,
	})
}

func SaveDashboard(c echo.Context) error {
	user := c.Get("user").(*models.User)

	// Estrutura para receber os dados do frontend
	var body struct {
		Salario float64  `json:"salario"`
		Gasto   float64  `json:"gasto"`
		Custo   float64  `json:"custo"`
		Gastos  []string `json:"gastos"`
	}

	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"erro": "Dados inválidos"})
	}

	// Converter array de gastos para string JSON
	gastosJSON, err := json.Marshal(body.Gastos)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"erro": "Erro ao processar gastos"})
	}

	// Verificar se já existe um dashboard para este usuário
	var dashboard models.Dashboard
	result := database.DB.Where("user_id = ?", user.ID).First(&dashboard)

	if result.Error != nil {
		// Criar novo dashboard
		dashboard = models.Dashboard{
			UserID:  user.ID,
			Salario: body.Salario,
			Gasto:   body.Gasto,
			Custo:   body.Custo,
			Gastos:  string(gastosJSON),
		}
		result = database.DB.Create(&dashboard)
	} else {
		// Atualizar dashboard existente
		dashboard.Salario = body.Salario
		dashboard.Gasto = body.Gasto
		dashboard.Custo = body.Custo
		dashboard.Gastos = string(gastosJSON)
		result = database.DB.Save(&dashboard)
	}

	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"erro": "Erro ao salvar dashboard"})
	}

	return c.JSON(http.StatusOK, echo.Map{"mensagem": "Dashboard salvo com sucesso"})
}