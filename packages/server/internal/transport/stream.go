package transport

import (
	"canvas-paint-webtransport-server/internal/application"
	"canvas-paint-webtransport-server/internal/message"

	"github.com/quic-go/webtransport-go"
)

func (t *TransportContext) readStream() (*message.Message, []byte, error) {
	msg, bytes, err := message.DecodeMessage(t.WebTransportStream)
	if err != nil {
		return nil, []byte{}, err
	}
	return msg, bytes, nil
}

func WriteToStream(stream *webtransport.Stream, bytes []byte) {
	if stream == nil {
		return
	}
	stream.Write(bytes)
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
		msg, bytes, err := t.readStream()
		if err != nil {
			sess.CloseWithError(400, "Session closed")
			return
		}
		t.ReceiveMessage(app, msg, bytes)
	}
}
