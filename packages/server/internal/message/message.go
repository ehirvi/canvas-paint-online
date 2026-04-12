package message

type MessageType byte

const (
	UserAuthenticate    MessageType = 0x01
	AuthenticateSuccess MessageType = 0x02
)

type Message struct {
	Length  [4]byte
	Type    MessageType
	Payload []byte
}
