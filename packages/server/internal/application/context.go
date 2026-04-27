package application

import (
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/user"
)

type ApplicationContext struct {
	SessionManager *session.Manager
	UserManager    *user.Manager
}

func CreateApplicationContext() *ApplicationContext {
	sessionManager := session.NewManager()
	userManager := user.NewManager()
	return &ApplicationContext{SessionManager: sessionManager, UserManager: userManager}
}
