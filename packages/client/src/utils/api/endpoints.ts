export const EApiEndpoint = {
  SESSION_CREATE: "/session/create",
  SESSION_JOIN: "/session/:sessionId/join",
  WEBTRANSPORT: "/session/wt",
} as const;

export type EApiEndpoint = (typeof EApiEndpoint)[keyof typeof EApiEndpoint];
