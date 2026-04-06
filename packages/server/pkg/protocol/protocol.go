package protocol

type SessionCreateResponse struct {
	SessionID   string `json:"sessionId"`
	AccessToken string `json:"accessToken"`
}
