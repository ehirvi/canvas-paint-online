import type { ISessionTokenPayload } from "./types";

const isObject = (data: unknown): data is object =>
  typeof data === "object" && data !== null;

const isString = (data: unknown): data is string =>
  typeof data === "string" && data.trim().length > 0;

export const isSessionTokenPayload = (
  data: unknown,
): data is ISessionTokenPayload => {
  return (
    isObject(data) &&
    "sessionId" in data &&
    isString(data.sessionId) &&
    "userId" in data &&
    isString(data.userId) &&
    "userRole" in data &&
    isString(data.userRole)
  );
};
