package application

import (
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/user"
)

type Application struct {
	SessionManager *session.Manager
	UserManager    *user.Manager
}

func CreateApplication() *Application {
	sessManager := session.NewManager()
	userManager := user.NewManager()
	return &Application{SessionManager: sessManager, UserManager: userManager}
}
