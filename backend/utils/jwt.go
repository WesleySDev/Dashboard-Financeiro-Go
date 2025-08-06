package utils

import (
    "fmt"
    "time"
    "github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte("chave-secreta")

func GenerateJWT(userID uint) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "id": userID,
        "exp": time.Now().Add(24 * time.Hour).Unix(),
    })
    return token.SignedString(jwtKey)
}

func ParseToken(tokenStr string) (uint, error) {
    fmt.Println("ParseToken recebeu:", tokenStr)
    
    // Remove o prefixo "Bearer " se existir
    if len(tokenStr) > 7 && tokenStr[:7] == "Bearer " {
        tokenStr = tokenStr[7:]
        fmt.Println("Token após remover Bearer:", tokenStr)
    }
    
    if tokenStr == "" {
        fmt.Println("Token está vazio")
        return 0, fmt.Errorf("token vazio")
    }
    
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        // Verifica se o método de assinatura é o esperado
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("método de assinatura inesperado: %v", token.Header["alg"])
        }
        return jwtKey, nil
    })
    
    if err != nil {
        fmt.Println("Erro ao analisar token:", err)
        return 0, err
    }
    
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        // Verifica se o ID existe no token
        if id, exists := claims["id"]; exists {
            fmt.Println("ID encontrado no token:", id)
            return uint(id.(float64)), nil
        } else {
            fmt.Println("ID não encontrado no token")
            return 0, fmt.Errorf("id não encontrado no token")
        }
    }
    
    fmt.Println("Token inválido ou claims não encontradas")
    return 0, fmt.Errorf("token inválido")
}
