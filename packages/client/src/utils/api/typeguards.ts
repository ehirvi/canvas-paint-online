import type { ISessionCreateResponse } from "./types";

const isObject = (data: unknown): data is object =>
  typeof data === "object" && data !== null;

const isString = (data: unknown): data is string =>
  typeof data === "string" && data.length > 0;

export const isSessionCreateResponse = (
  data: unknown,
): data is ISessionCreateResponse => {
  return (
    isObject(data) &&
    "sessionId" in data &&
    isString(data.sessionId) &&
    "accessToken" in data &&
    isString(data.accessToken)
  );
};
