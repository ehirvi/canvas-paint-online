package protocol

type SessionCreateResponse struct {
	SessionID    string `json:"sessionId"`
	SessionToken string `json:"sessionToken"`
}

type SessionJoinResponse struct {
	SessionToken string `json:"sessionToken"`
}
