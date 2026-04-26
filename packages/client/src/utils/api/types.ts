export interface ISessionCreateResponse {
  sessionId: string;
  sessionToken: string;
}

export interface ISessionJoinResponse extends Omit<
  ISessionCreateResponse,
  "sessionId"
> {}
