package session

import (
	"online-canvas-paint-server/internal/common"
	"online-canvas-paint-server/internal/user"

	"github.com/google/uuid"
	"github.com/quic-go/webtransport-go"
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

func (m *Manager) AddWebTransportSessionToUser(sessionId common.ID, userId common.ID, wtSession *webtransport.Session, wtStream *webtransport.Stream) {
	sess := m.GetSession(sessionId)
	sess.Users[userId].Session = wtSession
	sess.Users[userId].Stream = wtStream
}
