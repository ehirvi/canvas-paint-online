package routes

import (
	"net/http"
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"
	"online-canvas-paint-server/pkg/protocol"

	"github.com/google/uuid"
)

var SessionJoin = Route{
	Path:   "/session/{sessionID}/join",
	Method: HttpMethod(Post),
	Handler: func(m session.Manager, w http.ResponseWriter, r *http.Request) {
		sessionID := r.PathValue("sessionID")
		parsedID, err := uuid.Parse(sessionID)
		if err != nil {
			SendErrorResponse(w, "Invalid request format", http.StatusBadRequest)
			return
		}

		session := m.GetSession(parsedID)
		if session == nil {
			SendErrorResponse(w, "No session found", http.StatusNotFound)
			return
		}

		user := user.CreateUser(user.Guest)
		m.JoinSession(session.ID, user)
		accessToken := token.CreateAccessToken(user, session.ID)

		res := protocol.SessionJoinResponse{
			AccessToken: accessToken,
		}

		SendJsonResponse(w, res, http.StatusOK)
	}}
