package session

import (
	"online-canvas-paint-server/internal/common"
	"online-canvas-paint-server/internal/user"
)

type Session struct {
	ID    common.ID
	Users map[common.ID]*user.User
}
