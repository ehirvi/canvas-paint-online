package user

import (
	"online-canvas-paint-server/internal/common"

	"github.com/google/uuid"
	"github.com/quic-go/webtransport-go"
)

type Role string

const (
	Host  Role = "Host"
	Guest Role = "Guest"
)

type User struct {
	ID      common.ID
	Role    Role
	Session *webtransport.Session
}

func CreateUser(role Role) *User {
	id, _ := uuid.NewRandom()
	return &User{ID: id, Role: role, Session: &webtransport.Session{}}
}
