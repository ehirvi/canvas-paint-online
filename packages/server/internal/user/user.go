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

type Manager struct {
	users map[common.ID]*User
}

func NewManager() *Manager {
	return &Manager{users: make(map[common.ID]*User)}
}

func (m *Manager) CreateUser(role Role) *User {
	id, _ := uuid.NewRandom()
	user := &User{ID: id, Role: role, Session: &webtransport.Session{}}
	m.users[id] = user
	return user
}
