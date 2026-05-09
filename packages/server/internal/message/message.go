package message

import (
	"encoding/binary"
	"errors"
	"io"

	"github.com/quic-go/webtransport-go"
)

type MessageType byte

const (
	UserAuthenticate    MessageType = 0x01
	AuthenticateSuccess MessageType = 0x02
	StrokeSegment       MessageType = 0x03
	MousePosition       MessageType = 0x04
)

type Message struct {
	Type    MessageType
	Length  uint32
	Payload []byte
}

func EncodeMessage(msg Message) []byte {
	bufLen := 1 + 4 + msg.Length
	buf := make([]byte, bufLen)

	buf[0] = byte(msg.Type)
	binary.BigEndian.PutUint32(buf[1:5], msg.Length)
	copy(buf[5:], msg.Payload)

	return buf
}

func DecodeMessage(stream *webtransport.Stream) (*Message, []byte, error) {
	header := make([]byte, 5)

	_, err := io.ReadFull(stream, header)
	if err != nil {
		return nil, []byte{}, err
	}
	msgType := header[0]
	msgLength := binary.BigEndian.Uint32(header[1:5])

	frame := make([]byte, 5+msgLength)
	_, err = io.ReadFull(stream, frame[5:])
	if err != nil {
		return nil, []byte{}, err
	}
	msgPayload := frame[5:]
	copy(frame[:5], header)

	return &Message{
			Type:    MessageType(msgType),
			Length:  msgLength,
			Payload: msgPayload,
		},
		frame,
		nil
}

func DecodeDatagram(payload []byte) *Message {
	if len(payload) == 0 {
		return nil
	}

	return &Message{
		Type:    MessageType(payload[0]),
		Length:  binary.BigEndian.Uint32(payload[1:5]),
		Payload: payload[5:],
	}
}

func decodeStrokePosition(payload []byte) (uint32, uint32, uint32, uint32) {
	lastPosX := binary.BigEndian.Uint32(payload[:4])
	lastPosY := binary.BigEndian.Uint32(payload[4:8])
	posX := binary.BigEndian.Uint32(payload[8:12])
	posY := binary.BigEndian.Uint32(payload[12:])

	return lastPosX, lastPosY, posX, posY
}

func (msg Message) ValidateStrokeSegment() error {
	lastPosX, lastPosY, posX, posY := decodeStrokePosition(msg.Payload)
	if lastPosX > 1280 || posX > 1280 {
		return errors.New("Invalid message payload")
	}
	if lastPosY > 720 || posY > 720 {
		return errors.New("Invalid message payload")
	}

	return nil
}
