package models

import "time"

type User struct {
	ID         uint        `gorm:"primaryKey" json:"id"`
	Nome       string      `json:"nome"`
	Username   string      `gorm:"unique" json:"username"`
	Senha      string      `json:"senha"`
	CriadoEm   time.Time   `gorm:"autoCreateTime" json:"criado_em"`
	Transacoes []Transacao `json:"transacoes"`
}
