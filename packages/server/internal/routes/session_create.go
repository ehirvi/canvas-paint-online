package routes

import (
	"net/http"
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"
	"online-canvas-paint-server/pkg/protocol"
)

var SessionCreate = Route{
	Path:   "/session/create",
	Method: HttpMethod(Post),
	Handler: func(m session.Manager, w http.ResponseWriter, r *http.Request) {
		sessionId := m.CreateSession()
		user := user.CreateUser(user.Host)
		m.JoinSession(sessionId, user)
		token := token.CreateAccessToken(user, sessionId)

		res := protocol.SessionCreateResponse{
			SessionID:   sessionId.String(),
			AccessToken: token,
		}

		SendJsonResponse(w, res, http.StatusCreated)
	},
}
