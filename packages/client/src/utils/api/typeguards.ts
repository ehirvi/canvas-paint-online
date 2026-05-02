import type { ISessionResponse } from "./types";

const isObject = (data: unknown): data is object =>
  typeof data === "object" && data !== null;

const isString = (data: unknown): data is string =>
  typeof data === "string" && data.trim().length > 0;

export const isSessionResponse = (data: unknown): data is ISessionResponse => {
  return (
    isObject(data) && "sessionToken" in data && isString(data.sessionToken)
  );
};
