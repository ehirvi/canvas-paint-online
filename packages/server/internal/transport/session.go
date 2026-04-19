package transport

import (
	"fmt"
	"log"
	"net/http"
	"online-canvas-paint-server/internal/context"
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

func (t *TransportContext) parseMessage(context *context.ApplicationContext, msg *message.Message) message.Message {
	switch msg.Type {
	case message.UserAuthenticate:
		claims := token.VerifyAccessToken(msg.Payload)
		sessionId, err := uuid.Parse(claims.SessionID)
		userId, _ := uuid.Parse(claims.UserID)
		if err != nil {
			fmt.Printf("uuid err: %s\n", err)
		}
		context.SessionManager.AddWebTransportSessionToUser(sessionId, userId, t.WebTransportSession)
		resPayload := constructAuthSuccessMsg(true)
		return resPayload

	}
	return message.Message{}
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

func (t *TransportContext) sendStreamMessage(payload message.Message) {
	encodedPayload := message.EncodeMessage(payload)
	t.WebTransportStream.Write(encodedPayload)
}

func (t *TransportContext) readStreamMessage() (*message.Message, error) {
	msg, _ := message.DecodeMessage(t.WebTransportStream)
	return msg, nil
}

func (t *TransportContext) handleStream(context *context.ApplicationContext) {
	defer t.WebTransportStream.Close()

	for {
		msg, _ := t.readStreamMessage()
		resPayload := t.parseMessage(context, msg)
		t.sendStreamMessage(resPayload)
	}
}

func UpgradeToWebTransportSession(context *context.ApplicationContext, wtServer *webtransport.Server, w http.ResponseWriter, r *http.Request) {
	sess, err := wtServer.Upgrade(w, r)
	if err != nil {
		log.Printf("upgrading failed: %s", err)
		w.WriteHeader(500)
		return
	}

	go func() {
		stream, err := sess.AcceptStream(sess.Context())
		if err != nil {
			return
		}

		t := TransportContext{WebTransportSession: sess, WebTransportStream: stream}

		t.handleStream(context)
	}()
}
