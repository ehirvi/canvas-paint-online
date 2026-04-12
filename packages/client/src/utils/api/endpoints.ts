export const EApiEndpoint = {
  SESSION_CREATE: "/session/create",
  WEBTRANSPORT: "/session/wt",
} as const;

export type EApiEndpoint = (typeof EApiEndpoint)[keyof typeof EApiEndpoint];
