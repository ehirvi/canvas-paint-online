package token

import (
	"online-canvas-paint-server/internal/common"
	"online-canvas-paint-server/internal/user"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

func CreateAccessToken(user *user.User, sessionId common.ID) string {
	secret := []byte(os.Getenv("SIGNING_SECRET"))

	jwt := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sessionId": sessionId.String(),
		"userId":    user.ID.String(),
		"userRole":  string(user.Role),
	})
	token, _ := jwt.SignedString(secret)
	return token
}
