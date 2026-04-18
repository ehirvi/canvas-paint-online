import { appConfig } from "../config";
import { EApiEndpoint } from "./endpoints";
import { isSessionCreateResponse, isSessionJoinResponse } from "./typeguards";
import type { ISessionCreateResponse, ISessionJoinResponse } from "./types";

const serverPost = ({
  url,
  headers,
  body,
}: {
  url: string;
  headers?: HeadersInit;
  body?: BodyInit;
}): Promise<Response> => {
  return fetch(url, {
    method: "POST",
    headers,
    body,
  });
};

export const createSession = async (): Promise<
  ISessionCreateResponse | undefined
> => {
  const url = appConfig.API_URL + EApiEndpoint.SESSION_CREATE;

  const res = await serverPost({ url });
  const body = await res.json();

  if (isSessionCreateResponse(body)) {
    return body;
  }

  return;
};

export const joinSession = async (
  sessionId: string,
): Promise<ISessionJoinResponse | undefined> => {
  const url =
    appConfig.API_URL +
    EApiEndpoint.SESSION_JOIN.replace(":sessionId", sessionId);

  const res = await serverPost({ url });
  const body = await res.json();

  if (isSessionJoinResponse(body)) {
    return body;
  }

  return;
};
