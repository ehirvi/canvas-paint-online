package transport

import (
	"net/http"

	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/common"
	"online-canvas-paint-server/internal/session"

	"github.com/quic-go/webtransport-go"
)

type TransportContext struct {
	UserID              common.ID
	WebTransportSession *webtransport.Session
	WebTransportStream  *webtransport.Stream
	CanvasSession       *session.Session
}

func UpgradeToWebTransportSession(app *application.Application, wt *webtransport.Server, w http.ResponseWriter, r *http.Request) {
	sess, err := wt.Upgrade(w, r)
	if err != nil {
		w.WriteHeader(500)
		return
	}

	t := &TransportContext{WebTransportSession: sess}

	go t.HandleStream(app)

	go t.handleDatagrams(app)

}
