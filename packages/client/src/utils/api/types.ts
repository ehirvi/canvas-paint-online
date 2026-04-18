export interface ISessionCreateResponse {
  sessionId: string;
  accessToken: string;
}

export interface ISessionJoinResponse extends Omit<
  ISessionCreateResponse,
  "sessionId"
> {}
