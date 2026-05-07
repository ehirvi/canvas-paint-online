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
	WriteStream(user.Stream, msg)
}

func DispatchStrokeSegmentMsg(user *user.User, payload []byte) {
	if user == nil {
		return
	}
	msg := message.Message{Type: message.StrokeSegment, Length: uint16(len(payload)), Payload: payload}
	WriteStream(user.Stream, msg)
}

func DispatchMousePositionMsg(user *user.User, payload []byte) {
	if user == nil {
		return
	}
	msg := message.Message{Type: message.MousePosition, Length: uint16(len(payload)), Payload: payload}
	WriteDatagram(user.Session, msg)
}
