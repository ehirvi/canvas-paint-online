package transport

import (
	"context"
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readDatagram(ctx context.Context) (*message.Message, error) {
	bytes, _ := t.WebTransportSession.ReceiveDatagram(ctx)
	msg, _ := message.DecodeDatagram(bytes)
	return msg, nil
}

func WriteDatagram(s *webtransport.Session, payload message.Message) {
	bytes := message.EncodeMessage(payload)
	s.SendDatagram(bytes)
}

func (t *TransportContext) handleDatagrams(app *application.Application) {
	ctx := context.Background()
	for {
		msg, _ := t.readDatagram(ctx)
		t.ReceiveMessage(app, msg)
	}
}
