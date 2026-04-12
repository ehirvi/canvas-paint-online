package transport

import (
	"log"
	"net/http"

	"github.com/quic-go/webtransport-go"
)

func readStreamMessage(stream *webtransport.Stream) (*message.Message, error) {
	msg, _ := message.DecodeMessage(stream)
	return msg, nil
}

func handleStream(manager *session.Manager, session *webtransport.Session, stream *webtransport.Stream) {
	defer stream.Close()

	for {
		msg, _ := readStreamMessage(stream)
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
