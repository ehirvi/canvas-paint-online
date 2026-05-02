import { appConfig } from "../utils/config";
import { EApiEndpoint } from "./endpoints";
import { isSessionResponse } from "./typeguards";
import type { ISessionResponse } from "./types";

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
  ISessionResponse | undefined
> => {
  const url = appConfig.API_URL + EApiEndpoint.SESSION_CREATE;

  const res = await serverPost({ url });
  const body = await res.json();

  if (!isSessionResponse(body)) {
    return;
  }

  return body;
};

export const joinSession = async (
  sessionId: string,
): Promise<ISessionResponse | undefined> => {
  const url =
    appConfig.API_URL +
    EApiEndpoint.SESSION_JOIN.replace(":sessionId", sessionId);

  const res = await serverPost({ url });
  const body = await res.json();

  if (!isSessionResponse(body)) {
    return;
  }

  return body;
};
