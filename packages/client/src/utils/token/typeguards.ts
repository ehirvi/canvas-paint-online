import { isObject, isString } from "../typeguards";
import type { ISessionTokenPayload } from "./types";

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
