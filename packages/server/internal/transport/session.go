package transport

import (
	"net/http"

	"canvas-paint-webtransport-server/internal/application"
	"canvas-paint-webtransport-server/internal/common"
	"canvas-paint-webtransport-server/internal/session"

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

	go t.handleStream(app)

	go t.handleDatagrams(app)

}
