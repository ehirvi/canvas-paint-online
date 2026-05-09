package transport

import (
	"context"
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readDatagram(ctx context.Context) (*message.Message, []byte, error) {
	bytes, err := t.WebTransportSession.ReceiveDatagram(ctx)
	if err != nil {
		return nil, []byte{}, err
	}

	msg, err := message.DecodeDatagram(bytes)
	if err != nil {
		return nil, []byte{}, err
	}

	return msg, bytes, nil
}

func WriteDatagram(s *webtransport.Session, bytes []byte) {
	s.SendDatagram(bytes)
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
