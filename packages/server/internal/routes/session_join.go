package routes

import (
	"net/http"
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"
	"online-canvas-paint-server/pkg/protocol"

	"github.com/google/uuid"
)

var SessionJoin = Route{
	Path:   "/session/{sessionID}/join",
	Method: HttpMethod(Post),
	Handler: func(context *application.ApplicationContext, w http.ResponseWriter, r *http.Request) {
		sessionID := r.PathValue("sessionID")
		parsedID, err := uuid.Parse(sessionID)
		if err != nil {
			SendErrorResponse(w, "Invalid request format", http.StatusBadRequest)
			return
		}

		session := context.SessionManager.GetSession(parsedID)
		if session == nil {
			SendErrorResponse(w, "No session found", http.StatusNotFound)
			return
		}

		if len(session.Users) == 2 {
			SendErrorResponse(w, "Session has maximum amount of users", http.StatusForbidden)
			return
		}

		user := context.UserManager.CreateUser(user.Guest)
		context.SessionManager.JoinSession(session.ID, user)
		token := token.CreateSessionToken(user, session.ID)

		res := protocol.SessionJoinResponse{
			SessionToken: token,
		}

		SendJsonResponse(w, res, http.StatusOK)
	}}
