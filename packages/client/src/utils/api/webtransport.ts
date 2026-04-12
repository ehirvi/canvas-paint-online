import { appConfig } from "../config";
import {
  decodeProtocolMessage,
  EMessageType,
  encodeProtocolMessage,
  encodeStringToBytes,
  isValidMessageType,
  type IMessage,
} from "../protocol";
import { EApiEndpoint } from "./endpoints";

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

export const readFromStream = async (
  readable: ReadableStream,
  messageHandler: (type: number, payload: Uint8Array<ArrayBuffer>) => void,
) => {
  const reader = readable.getReader();
  let buffer = new Uint8Array(0);
  try {
    while (true) {
      const lenBuf = await decodeProtocolMessage(reader, buffer, 4);

      if (!lenBuf) return;

      const length = new DataView(lenBuf.out.buffer).getUint32(0);

      const msgBuf = await decodeProtocolMessage(reader, lenBuf.buffer, length);

      if (!msgBuf) return;

      const type = msgBuf.out[0];
      const payload = msgBuf.out.slice(1);

      if (isValidMessageType(type)) {
        messageHandler(type, payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const writeToStream = async (
  writable: WritableStream,
  payload: Uint8Array<ArrayBuffer>,
) => {
  const writer = writable.getWriter();
  writer.write(payload);
};

export const authenticateUser = (
  writable: WritableStream,
  accessToken: string,
) => {
  const tokenBytes = encodeStringToBytes(accessToken);
  const payload: IMessage = {
    length: 1 + tokenBytes.length,
    type: EMessageType.USER_AUTHENTICATE,
    message: tokenBytes,
  };
  const protocolMessage = encodeProtocolMessage(payload);
  writeToStream(writable, protocolMessage);
};
