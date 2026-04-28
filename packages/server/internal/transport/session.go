package transport

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/token"
	"online-canvas-paint-server/internal/user"

	"github.com/google/uuid"
	"github.com/quic-go/webtransport-go"
)

type TransportContext struct {
	WebTransportSession *webtransport.Session
	WebTransportStream  *webtransport.Stream
	User                *user.User
	CanvasSession       *session.Session
}

func (t *TransportContext) handleUserAuthenticate(app *application.Application, msg message.Message) {
	claims := token.VerifySessionToken(msg.Payload)
	sessionID, err := uuid.Parse(claims.SessionID)
	userID, _ := uuid.Parse(claims.UserID)
	if err != nil {
		fmt.Printf("uuid err: %s\n", err)
	}
	app.SessionManager.AddWebTransportSessionToUser(sessionID, userID, t.WebTransportSession, t.WebTransportStream)

	sess := app.SessionManager.GetSession(sessionID)
	user := app.UserManager.GetUser(userID)
	t.CanvasSession = sess
	t.User = user

	authSuccessMsg := constructAuthSuccessMsg(true)
	sendStreamMessage(user.Stream, authSuccessMsg)
}

func (t *TransportContext) handleStrokeSegmentUpdate(msg message.Message) {
	err := msg.ValidateStrokeSegment()
	if err != nil {
		log.Println(err)
	}
	peerMsg := constructStrokeSegmentMsg(msg.Payload)
	for id, user := range t.CanvasSession.Users {
		if id != t.User.ID {
			sendStreamMessage(user.Stream, peerMsg)
		}
	}

}

func (t *TransportContext) handleMousePosition(msg message.Message) {
	peerMsg := constructMousePositionMsg(msg.Payload)
	for id, user := range t.CanvasSession.Users {
		if id != t.User.ID {
			sendDatagram(user.Session, peerMsg)
		}
	}
}

func (t *TransportContext) parseMessage(app *application.Application, msg *message.Message) {
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

func constructAuthSuccessMsg(success bool) message.Message {
	var payload byte
	if success {
		payload = 1
	} else {
		payload = 0
	}

	msg := message.Message{Type: message.AuthenticateSuccess, Payload: []byte{payload}}
	return msg
}

func constructStrokeSegmentMsg(payload []byte) message.Message {
	msg := message.Message{Type: message.StrokeSegment, Payload: payload}
	return msg
}

func constructMousePositionMsg(payload []byte) message.Message {
	msg := message.Message{Type: message.MousePosition, Payload: payload}
	return msg
}

func sendStreamMessage(s *webtransport.Stream, payload message.Message) {
	bytes := message.EncodeMessage(payload)
	s.Write(bytes)
}

func (t *TransportContext) readStreamMessage() (*message.Message, error) {
	msg, _ := message.DecodeMessage(t.WebTransportStream)
	return msg, nil
}

func (t *TransportContext) handleStream(app *application.Application) {
	defer t.WebTransportStream.Close()

	for {
		msg, _ := t.readStreamMessage()
		t.parseMessage(app, msg)
	}
}

func sendDatagram(s *webtransport.Session, payload message.Message) {
	bytes := message.EncodeMessage(payload)
	s.SendDatagram(bytes)
}

func (t *TransportContext) readDatagram(ctx context.Context) (*message.Message, error) {
	bytes, _ := t.WebTransportSession.ReceiveDatagram(ctx)
	msg, _ := message.DecodeDatagram(bytes)
	return msg, nil
}

func (t *TransportContext) handleDatagrams(app *application.Application) {
	ctx := context.Background()
	for {
		msg, _ := t.readDatagram(ctx)
		t.parseMessage(app, msg)
	}
}

func UpgradeToWebTransportSession(app *application.Application, wt *webtransport.Server, w http.ResponseWriter, r *http.Request) {
	sess, err := wt.Upgrade(w, r)
	if err != nil {
		log.Printf("upgrading failed: %s", err)
		w.WriteHeader(500)
		return
	}

	t := TransportContext{WebTransportSession: sess}
	go func() {
		stream, err := sess.AcceptStream(sess.Context())
		if err != nil {
			return
		}

		t.WebTransportStream = stream
		t.handleStream(app)
	}()

	go func() {
		t.handleDatagrams(app)
	}()
}
