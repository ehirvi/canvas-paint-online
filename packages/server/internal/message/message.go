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
	Length  uint16
	Payload []byte
}

const (
	CoordinateByteSize    = 2
	MessageTypeByteSize   = 1
	MessageLengthByteSize = 2

	MessageTypeByteOffset    = 0
	MessageLengthByteOffset  = 1
	MessagePayloadByteOffset = 3
)

func EncodeMessage(msg Message) []byte {
	bufLen := MessageTypeByteSize + MessageLengthByteSize + msg.Length
	buf := make([]byte, bufLen)

	buf[0] = byte(msg.Type)
	binary.BigEndian.PutUint16(buf[MessageLengthByteOffset:MessagePayloadByteOffset], msg.Length)
	copy(buf[MessagePayloadByteOffset:], msg.Payload)

	return buf
}

func DecodeMessage(stream *webtransport.Stream) (*Message, error) {
	msg := &Message{}

	typeBuf := make([]byte, MessageTypeByteSize)
	_, typeErr := io.ReadFull(stream, typeBuf[:])
	if typeErr != nil {
		return nil, typeErr
	}
	msgType := typeBuf[0]

	lenBuf := make([]byte, MessageLengthByteSize)
	_, lenErr := io.ReadFull(stream, lenBuf[:])
	if lenErr != nil {
		return nil, lenErr
	}
	msgLength := binary.BigEndian.Uint16(lenBuf[:])

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
	msg.Type = MessageType(payload[MessageTypeByteOffset])
	msg.Length = binary.BigEndian.Uint16(payload[MessageLengthByteOffset:MessagePayloadByteOffset])
	msg.Payload = payload[MessagePayloadByteOffset:]
	return msg, nil
}

func decodeStrokePosition(payload []byte) (uint16, uint16, uint16, uint16) {
	lastPosX := binary.BigEndian.Uint16(payload[:CoordinateByteSize])
	lastPosY := binary.BigEndian.Uint16(payload[CoordinateByteSize : CoordinateByteSize*2])
	posX := binary.BigEndian.Uint16(payload[CoordinateByteSize*2 : CoordinateByteSize*3])
	posY := binary.BigEndian.Uint16(payload[CoordinateByteSize*3:])

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
