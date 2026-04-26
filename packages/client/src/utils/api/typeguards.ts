import type { ISessionCreateResponse, ISessionJoinResponse } from "./types";

const isObject = (data: unknown): data is object =>
  typeof data === "object" && data !== null;

const isString = (data: unknown): data is string =>
  typeof data === "string" && data.trim().length > 0;

export const isSessionCreateResponse = (
  data: unknown,
): data is ISessionCreateResponse => {
  return (
    isObject(data) &&
    "sessionId" in data &&
    isString(data.sessionId) &&
    "sessionToken" in data &&
    isString(data.sessionToken)
  );
};

export const isSessionJoinResponse = (
  data: unknown,
): data is ISessionJoinResponse => {
  return (
    isObject(data) && "sessionToken" in data && isString(data.sessionToken)
  );
};
