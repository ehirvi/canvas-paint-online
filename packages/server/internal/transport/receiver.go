package transport

import (
	"fmt"
	"canvas-paint-webtransport-server/internal/application"
	"canvas-paint-webtransport-server/internal/message"
	"canvas-paint-webtransport-server/internal/token"

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

	t.DispatchAuthSuccessMsg(user)
}

func (t *TransportContext) handleStrokeSegmentUpdate(bytes []byte) {
	t.DispatchToPeerStream(bytes)
}

func (t *TransportContext) handleMousePosition(bytes []byte) {
	t.DispatchDatagramToPeer(bytes)
}

func (t *TransportContext) ReceiveMessage(app *application.Application, msg *message.Message, bytes []byte) {
	if msg == nil {
		return
	}

	switch msg.Type {
	case message.UserAuthenticate:
		t.handleUserAuthenticate(app, *msg)
	case message.StrokeSegment:
		t.handleStrokeSegmentUpdate(bytes)
	case message.MousePosition:
		t.handleMousePosition(bytes)
	}
}
