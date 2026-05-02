import { isSessionTokenPayload } from "./typeguards";
import type { ISessionTokenPayload } from "./types";

const decodeJwtPayload = (token: string): string | undefined => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return;
  }

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const payloadAsString = atob(base64);
  return payloadAsString;
};

const parseJwtPayload = (token: string): ISessionTokenPayload | undefined => {
  const payloadAsString = decodeJwtPayload(token);

  if (!payloadAsString) {
    return;
  }

  const payloadAsObject = JSON.parse(payloadAsString);

  if (!isSessionTokenPayload(payloadAsObject)) {
    return;
  }

  return payloadAsObject;
};

export const getSessionId = (token: string): string | undefined => {
  const payload = parseJwtPayload(token);

  if (!payload) {
    return;
  }

  return payload.sessionId;
};
