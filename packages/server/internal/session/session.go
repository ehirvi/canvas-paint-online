package session

import (
	"canvas-paint-webtransport-server/internal/common"
	"canvas-paint-webtransport-server/internal/user"
)

type Session struct {
	ID    common.ID
	Users map[common.ID]*user.User
}
