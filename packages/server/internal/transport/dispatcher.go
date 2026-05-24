package transport

import (
	"canvas-paint-webtransport-server/internal/message"
	"canvas-paint-webtransport-server/internal/user"
)

func (t *TransportContext) getPeer() *user.User {
	var peer *user.User
	for id, user := range t.CanvasSession.Users {
		if id != t.UserID {
			peer = user
		}
	}
	return peer
}

func (t *TransportContext) DispatchDatagramToPeer(bytes []byte) {
	peer := t.getPeer()
	if peer == nil {
		return
	}
	WriteDatagram(peer.Session, bytes)
}

func (t *TransportContext) DispatchToPeerStream(bytes []byte) {
	peer := t.getPeer()
	if peer == nil {
		return
	}
	WriteToStream(peer.Stream, bytes)

}

func (t *TransportContext) DispatchToUserStream(bytes []byte) {
	WriteToStream(t.WebTransportStream, bytes)
}

func (t *TransportContext) DispatchAuthSuccessMsg(user *user.User) {
	if user == nil {
		return
	}

	msg := message.Message{Type: message.AuthenticateSuccess, Length: 1, Payload: []byte{1}}
	bytes := message.EncodeMessage(msg)
	t.DispatchToUserStream(bytes)
}
