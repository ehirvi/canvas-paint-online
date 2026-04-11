import { appConfig } from "../config";
import { EApiEndpoint } from "./endpoints";

export const createWebTransportConnection = async (): Promise<WebTransport> => {
  const url = appConfig.API_URL + EApiEndpoint.WEBTRANSPORT;
  const wt = new WebTransport(url);

  await wt.ready;
  return wt;
};
