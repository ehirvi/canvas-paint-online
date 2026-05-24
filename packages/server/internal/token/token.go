package token

import (
	"fmt"
	"canvas-paint-webtransport-server/internal/common"
	"canvas-paint-webtransport-server/internal/user"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

type CustomJwtClaims struct {
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`
	UserRole  string `json:"userRole"`
	jwt.RegisteredClaims
}

func CreateSessionToken(user *user.User, sessionID common.ID) string {
	secret := []byte(os.Getenv("SIGNING_SECRET"))

	jwt := jwt.NewWithClaims(jwt.SigningMethodHS256, CustomJwtClaims{
		SessionID: sessionID.String(),
		UserID:    user.ID.String(),
		UserRole:  string(user.Role),
	})
	token, _ := jwt.SignedString(secret)
	return token
}

func VerifySessionToken(payload []byte) *CustomJwtClaims {
	secret := []byte(os.Getenv("SIGNING_SECRET"))
	token, err := jwt.ParseWithClaims(string(payload), &CustomJwtClaims{}, func(token *jwt.Token) (any, error) {
		return secret, nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	if err != nil {
		fmt.Printf("jwt error: %s\n", err)
	}

	if !token.Valid {
		fmt.Println("jwt invalid or expired")
	}

	claims, ok := token.Claims.(*CustomJwtClaims)

	if !ok {
		fmt.Println("could not get jwt claims")
	}

	return claims
}
