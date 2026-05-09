package transport

import (
	"online-canvas-paint-server/internal/message"
	"online-canvas-paint-server/internal/user"
)

func DispatchAuthSuccessMsg(user *user.User, success bool) {
	if user == nil {
		return
	}
	var payload byte
	if success {
		payload = 1
	} else {
		payload = 0
	}

	msg := message.Message{Type: message.AuthenticateSuccess, Length: 1, Payload: []byte{payload}}
	bytes := message.EncodeMessage(msg)
	WriteStream(user.Stream, bytes)
}

func DispatchStrokeSegmentMsg(user *user.User, bytes []byte) {
	if user == nil {
		return
	}
	WriteStream(user.Stream, bytes)
}

func DispatchMousePositionMsg(user *user.User, bytes []byte) {
	if user == nil {
		return
	}
	WriteDatagram(user.Session, bytes)
}
