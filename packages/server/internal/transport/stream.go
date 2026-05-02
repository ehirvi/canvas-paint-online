package transport

import (
	"online-canvas-paint-server/internal/application"
	"online-canvas-paint-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readStream() (*message.Message, error) {
	msg, err := message.DecodeMessage(t.WebTransportStream)
	if err != nil {
		return nil, err
	}
	return msg, nil
}

func WriteStream(s *webtransport.Stream, payload message.Message) {
	bytes := message.EncodeMessage(payload)
	s.Write(bytes)
}

func (t *TransportContext) handleStream(app *application.Application) {
	sess := t.WebTransportSession
	stream, err := sess.AcceptStream(sess.Context())
	if err != nil {
		return
	}

	t.WebTransportStream = stream
	defer stream.Close()

	for {
		msg, err := t.readStream()
		if err != nil {
			sess.CloseWithError(400, "Session closed")
			return
		}
		t.ReceiveMessage(app, msg)
	}
}
