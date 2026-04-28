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
	Length  [4]byte
	Type    MessageType
	Payload []byte
}

func EncodeMessage(msg Message) []byte {
	len := 1 + len(msg.Payload)
	buf := make([]byte, 4+len)
	binary.BigEndian.PutUint32(buf[0:4], uint32(len))
	buf[4] = byte(msg.Type)
	copy(buf[5:], msg.Payload)

	return buf
}

func DecodeMessage(stream *webtransport.Stream) (*Message, error) {
	msg := &Message{}
	lenBuf := msg.Length
	_, err := io.ReadFull(stream, lenBuf[:])
	if err != nil {
		return nil, err
	}

	length := binary.BigEndian.Uint32(lenBuf[:])

	data := make([]byte, length)
	_, err = io.ReadFull(stream, data)

	if err != nil {
		return nil, err
	}

	msg.Type = MessageType(data[0])
	msg.Payload = data[1:]

	return msg, nil
}

func DecodeDatagram(payload []byte) (*Message, error) {
	if len(payload) == 0 {
		return nil, nil
	}

	msg := &Message{}
	msg.Type = MessageType(payload[4])
	msg.Payload = payload[5:]
	return msg, nil
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
