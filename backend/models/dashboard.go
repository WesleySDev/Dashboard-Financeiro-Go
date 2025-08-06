package models

import "time"

type Dashboard struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	Salario   float64   `json:"salario"`
	Gasto     float64   `json:"gasto"`
	Custo     float64   `json:"custo"`
	Gastos    string    `json:"gastos"` // Armazenado como JSON string
	CriadoEm  time.Time `gorm:"autoCreateTime" json:"criado_em"`
	AtualizadoEm time.Time `gorm:"autoUpdateTime" json:"atualizado_em"`
}