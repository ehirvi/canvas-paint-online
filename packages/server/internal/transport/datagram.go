package transport

import (
	"context"
	"canvas-paint-webtransport-server/internal/application"
	"canvas-paint-webtransport-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readDatagram(ctx context.Context) (*message.Message, []byte, error) {
	bytes, err := t.WebTransportSession.ReceiveDatagram(ctx)
	if err != nil {
		return nil, []byte{}, err
	}

	msg := message.DecodeDatagram(bytes)

	return msg, bytes, nil
}

func WriteDatagram(session *webtransport.Session, bytes []byte) {
	if session == nil {
		return
	}
	session.SendDatagram(bytes)
}

func (t *TransportContext) handleDatagrams(app *application.Application) {
	ctx := context.Background()
	for {
		msg, bytes, err := t.readDatagram(ctx)

		if err != nil {
			t.WebTransportSession.CloseWithError(400, "Session closed")
			return
		}

		t.ReceiveMessage(app, msg, bytes)
	}
}
