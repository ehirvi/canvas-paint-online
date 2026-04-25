import { EApiEndpoint } from "../api/endpoints";
import { appConfig } from "../config";

export const createWebTransportConnection = async (): Promise<WebTransport> => {
  const url = appConfig.API_URL + EApiEndpoint.WEBTRANSPORT;
  const wt = new WebTransport(url);

  await wt.ready;
  return wt;
};

export const setupWebTransportStream = async (
  wt: WebTransport,
): Promise<WebTransportBidirectionalStream> => {
  const stream = await wt.createBidirectionalStream();
  return stream;
};
