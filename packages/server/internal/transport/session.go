package transport

import (
	"fmt"
	"log"
	"net/http"
	"online-canvas-paint-server/internal/message"
	"online-canvas-paint-server/internal/session"
	"online-canvas-paint-server/internal/token"

	"github.com/google/uuid"
	"github.com/quic-go/webtransport-go"
)

func parseMessage(manager *session.Manager, session *webtransport.Session, msg *message.Message) message.Message {
	switch msg.Type {
	case message.UserAuthenticate:
		claims := token.VerifyAccessToken(msg.Payload)
		sessionId, err := uuid.Parse(claims.SessionID)
		userId, _ := uuid.Parse(claims.UserID)
		if err != nil {
			fmt.Printf("uuid err: %s\n", err)
		}
		manager.AddWebTransportSessionToUser(sessionId, userId, session)
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

func sendStreamMessage(stream *webtransport.Stream, payload message.Message) {
	encodedPayload := message.EncodeMessage(payload)
	stream.Write(encodedPayload)
}

func readStreamMessage(stream *webtransport.Stream) (*message.Message, error) {
	msg, _ := message.DecodeMessage(stream)
	return msg, nil
}

func handleStream(manager *session.Manager, session *webtransport.Session, stream *webtransport.Stream) {
	defer stream.Close()

	for {
		msg, _ := readStreamMessage(stream)
		resPayload := parseMessage(manager, session, msg)
		sendStreamMessage(stream, resPayload)
	}
}

func UpgradeToWebTransportSession(manager *session.Manager, wtServer *webtransport.Server, w http.ResponseWriter, r *http.Request) {
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

		handleStream(manager, sess, stream)
	}()
}
