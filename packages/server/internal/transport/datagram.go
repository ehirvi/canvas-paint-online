package transport

import (
	"context"
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readDatagram(ctx context.Context) (*message.Message, error) {
	bytes, datagramErr := t.WebTransportSession.ReceiveDatagram(ctx)
	if datagramErr != nil {
		return nil, datagramErr
	}

	msg, decodeErr := message.DecodeDatagram(bytes)
	if decodeErr != nil {
		return nil, decodeErr
	}

	return msg, nil
}

func WriteDatagram(s *webtransport.Session, payload message.Message) {
	bytes := message.EncodeMessage(payload)
	s.SendDatagram(bytes)
}

func (t *TransportContext) handleDatagrams(app *application.Application) {
	ctx := context.Background()
	for {
		msg, err := t.readDatagram(ctx)

		if err != nil {
			t.WebTransportSession.CloseWithError(400, "Session closed")
			return
		}

		t.ReceiveMessage(app, msg)
	}
}
