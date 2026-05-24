package user

import (
	"canvas-paint-webtransport-server/internal/common"
	"sync"

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
	Stream  *webtransport.Stream
}

type Manager struct {
	users map[common.ID]*User
	mu    sync.Mutex
}

func NewManager() *Manager {
	return &Manager{users: make(map[common.ID]*User)}
}

func (m *Manager) CreateUser(role Role) *User {
	id, _ := uuid.NewRandom()
	user := &User{ID: id, Role: role, Session: &webtransport.Session{}, Stream: &webtransport.Stream{}}

	m.mu.Lock()
	defer m.mu.Unlock()

	m.users[id] = user
	return user
}

func (m *Manager) GetUser(id common.ID) *User {
	m.mu.Lock()
	defer m.mu.Unlock()

	user := m.users[id]
	return user
}

func (m *Manager) AddWebTransportSessionToUser(user *User, sess *webtransport.Session) {
	m.mu.Lock()
	defer m.mu.Unlock()
	user.Session = sess
}

func (m *Manager) AddWebTransportStreamToUser(user *User, stream *webtransport.Stream) {
	m.mu.Lock()
	defer m.mu.Unlock()
	user.Stream = stream
}
