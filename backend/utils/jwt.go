package utils

import (
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
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return jwtKey, nil
    })
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return uint(claims["id"].(float64)), nil
    }
    return 0, err
}
