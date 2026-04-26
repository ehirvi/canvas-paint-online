package routes

import (
	"net/http"
	"online-canvas-paint-server/internal/context"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"
	"online-canvas-paint-server/pkg/protocol"
)

var SessionCreate = Route{
	Path:   "/session/create",
	Method: HttpMethod(Post),
	Handler: func(context *context.ApplicationContext, w http.ResponseWriter, r *http.Request) {
		sessionId := context.SessionManager.CreateSession()
		user := context.UserManager.CreateUser(user.Host)
		context.SessionManager.JoinSession(sessionId, user)
		token := token.CreateSessionToken(user, sessionId)

		res := protocol.SessionCreateResponse{
			SessionID:    sessionId.String(),
			SessionToken: token,
		}

		SendJsonResponse(w, res, http.StatusCreated)
	},
}
