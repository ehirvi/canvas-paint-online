package session

import (
	"online-canvas-paint-server/internal/common"
	"online-canvas-paint-server/internal/user"

	"github.com/google/uuid"
)

type Manager struct {
	sessions map[common.ID]*Session
}

func NewManager() *Manager {
	return &Manager{sessions: make(map[common.ID]*Session)}
}

func (m *Manager) CreateSession() common.ID {
	id, _ := uuid.NewRandom()
	m.sessions[id] = &Session{ID: id, Users: make(map[common.ID]*user.User)}
	return id
}

func (m *Manager) GetSession(id common.ID) *Session {
	sess := m.sessions[id]
	return sess
}

func (m *Manager) JoinSession(sessionId common.ID, user *user.User) {
	sess := m.GetSession(sessionId)
	sess.Users[user.ID] = user
}
