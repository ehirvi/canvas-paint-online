package routes

import (
	"net/http"

	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"
	"online-canvas-paint-server/pkg/protocol"
)

var SessionCreate = Route{
	Path:   "/session/create",
	Method: HttpMethod(Post),
	Handler: func(app *application.Application, w http.ResponseWriter, r *http.Request) {
		sessionId := app.SessionManager.CreateSession()
		user := app.UserManager.CreateUser(user.Host)
		app.SessionManager.JoinSession(sessionId, user)
		token := token.CreateSessionToken(user, sessionId)

		res := protocol.SessionCreateResponse{
			SessionID:    sessionId.String(),
			SessionToken: token,
		}

		SendJsonResponse(w, res, http.StatusCreated)
	},
}
