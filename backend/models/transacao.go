package models

import "time"

type Transacao struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    UserID    uint      `json:"user_id"`
    Tipo      string    `json:"tipo"`
    Titulo    string    `json:"titulo"`
    Valor     float64   `json:"valor"`
    Data      time.Time `json:"data"`
    CriadoEm  time.Time `gorm:"autoCreateTime" json:"criado_em"`
}
