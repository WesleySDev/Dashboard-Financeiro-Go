package models

import "time"

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Nome      string    `json:"nome"`
    Email     string    `gorm:"unique" json:"email"`
    Senha     string    `json:"-"`
    CriadoEm  time.Time `gorm:"autoCreateTime" json:"criado_em"`
    Transacoes []Transacao `json:"transacoes"`
}
