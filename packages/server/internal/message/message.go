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

func DecodeMessage(stream *webtransport.Stream) (*Message, error) {
	msg := &Message{}

	typeBuf := make([]byte, 1)
	_, typeErr := io.ReadFull(stream, typeBuf[:])
	if typeErr != nil {
		return nil, typeErr
	}
	msgType := typeBuf[0]

	lenBuf := make([]byte, 4)
	_, lenErr := io.ReadFull(stream, lenBuf[:])
	if lenErr != nil {
		return nil, lenErr
	}
	msgLength := binary.BigEndian.Uint32(lenBuf[:])

	payloadBuf := make([]byte, msgLength)
	_, payloadErr := io.ReadFull(stream, payloadBuf)
	if payloadErr != nil {
		return nil, payloadErr
	}
	msgPayload := payloadBuf[:]

	msg.Type = MessageType(msgType)
	msg.Length = msgLength
	msg.Payload = msgPayload

	return msg, nil
}

func DecodeDatagram(payload []byte) (*Message, error) {
	if len(payload) == 0 {
		return nil, nil
	}

	msg := &Message{}
	msg.Type = MessageType(payload[0])
	msg.Length = binary.BigEndian.Uint32(payload[1:5])
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
