package routes

import (
	"net/http"

	"canvas-paint-webtransport-server/internal/application"
	"canvas-paint-webtransport-server/internal/token"
	"canvas-paint-webtransport-server/internal/user"
	"canvas-paint-webtransport-server/pkg/protocol"
)

var SessionCreate = Route{
	Path:   "/session/create",
	Method: HttpMethod(Post),
	Handler: func(app *application.Application, w http.ResponseWriter, r *http.Request) {
		sessionID := app.SessionManager.CreateSession()
		user := app.UserManager.CreateUser(user.Host)
		app.SessionManager.JoinSession(sessionID, user)
		token := token.CreateSessionToken(user, sessionID)

		res := protocol.SessionResponse{
			SessionToken: token,
		}

		SendJsonResponse(w, res, http.StatusCreated)
	},
}
