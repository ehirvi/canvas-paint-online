package session

import (
	"canvas-paint-webtransport-server/internal/common"
	"canvas-paint-webtransport-server/internal/user"
	"sync"

	"github.com/google/uuid"
)

type Manager struct {
	sessions map[common.ID]*Session
	mu       sync.Mutex
}

func NewManager() *Manager {
	return &Manager{sessions: make(map[common.ID]*Session)}
}

func (m *Manager) CreateSession() common.ID {
	id, _ := uuid.NewRandom()
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessions[id] = &Session{ID: id, Users: make(map[common.ID]*user.User)}
	return id
}

func (m *Manager) GetSession(id common.ID) *Session {
	m.mu.Lock()
	defer m.mu.Unlock()

	sess := m.sessions[id]
	return sess
}

func (m *Manager) JoinSession(sessID common.ID, user *user.User) {
	m.mu.Lock()
	defer m.mu.Unlock()

	sess := m.sessions[sessID]
	sess.Users[user.ID] = user
}
