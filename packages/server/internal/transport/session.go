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

	}
	return message.Message{}
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
