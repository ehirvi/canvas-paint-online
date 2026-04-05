package transport

import (
	"log"
	"net/http"

	"github.com/quic-go/webtransport-go"
)

func UpgradeToWebTransportSession(wtServer *webtransport.Server, w http.ResponseWriter, r *http.Request) {
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
		stream.Write([]byte("ping"))
	}()
}
