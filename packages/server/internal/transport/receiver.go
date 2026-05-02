package transport

import (
	"fmt"
	"log"
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"

	"github.com/google/uuid"
)

func (t *TransportContext) handleUserAuthenticate(app *application.Application, msg message.Message) {
	claims := token.VerifySessionToken(msg.Payload)
	sessionID, err := uuid.Parse(claims.SessionID)
	userID, _ := uuid.Parse(claims.UserID)
	if err != nil {
		fmt.Printf("uuid err: %s\n", err)
	}

	user := app.UserManager.GetUser(userID)
	app.UserManager.AddWebTransportSessionToUser(user, t.WebTransportSession)
	app.UserManager.AddWebTransportStreamToUser(user, t.WebTransportStream)

	t.UserID = user.ID

	sess := app.SessionManager.GetSession(sessionID)
	t.CanvasSession = sess

	DispatchAuthSuccessMsg(user, true)
}

func (t *TransportContext) handleStrokeSegmentUpdate(msg message.Message) {
	err := msg.ValidateStrokeSegment()
	if err != nil {
		log.Println(err)
	}
	var peer *user.User
	for id, user := range t.CanvasSession.Users {
		if id != t.UserID {
			peer = user
		}
	}
	DispatchStrokeSegmentMsg(peer, msg.Payload)
}

func (t *TransportContext) handleMousePosition(msg message.Message) {
	var peer *user.User
	for id, user := range t.CanvasSession.Users {
		if id != t.UserID {
			peer = user
		}
	}
	DispatchMousePositionMsg(peer, msg.Payload)
}

func (t *TransportContext) ReceiveMessage(app *application.Application, msg *message.Message) {
	if msg == nil {
		return
	}

	switch msg.Type {
	case message.UserAuthenticate:
		t.handleUserAuthenticate(app, *msg)
	case message.StrokeSegment:
		t.handleStrokeSegmentUpdate(*msg)
	case message.MousePosition:
		t.handleMousePosition(*msg)
	}
}
