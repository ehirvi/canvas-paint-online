package transport

import (
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readStream() (*message.Message, error) {
	msg, _ := message.DecodeMessage(t.WebTransportStream)
	return msg, nil
}

func WriteStream(s *webtransport.Stream, payload message.Message) {
	bytes := message.EncodeMessage(payload)
	s.Write(bytes)
}

func (t *TransportContext) HandleStream(app *application.Application) {
	sess := t.WebTransportSession
	stream, err := sess.AcceptStream(sess.Context())
	if err != nil {
		return
	}

	t.WebTransportStream = stream
	defer stream.Close()

	for {
		msg, _ := t.readStream()
		t.ReceiveMessage(app, msg)
	}
}
