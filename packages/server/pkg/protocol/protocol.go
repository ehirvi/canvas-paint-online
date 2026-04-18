package protocol

type SessionCreateResponse struct {
	SessionID   string `json:"sessionId"`
	AccessToken string `json:"accessToken"`
}

type SessionJoinResponse struct {
	AccessToken string `json:"accessToken"`
}
