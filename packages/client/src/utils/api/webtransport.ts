import type { TStrokePositionSegment } from "../../provider";
import { appConfig } from "../config";
import {
  decodeProtocolMessage,
  EMessageType,
  encodePositionToBytes,
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
  reader: ReadableStreamDefaultReader,
  messageHandler: (
    type: EMessageType,
    payload: Uint8Array<ArrayBuffer>,
  ) => void,
) => {
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
  writer: WritableStreamDefaultWriter,
  payload: Uint8Array<ArrayBuffer>,
) => {
  writer.write(payload);
};

export const authenticateUser = (
  writer: WritableStreamDefaultWriter,
  accessToken: string,
) => {
  const tokenBytes = encodeStringToBytes(accessToken);
  const message: IMessage = {
    length: 1 + tokenBytes.length,
    type: EMessageType.USER_AUTHENTICATE,
    payload: tokenBytes,
  };
  const protocolMessage = encodeProtocolMessage(message);
  writeToStream(writer, protocolMessage);
};

export const updateUserStrokePosition = (
  writer: WritableStreamDefaultWriter,
  segment: TStrokePositionSegment,
) => {
  const positionBytes = encodePositionToBytes(segment);
  const message: IMessage = {
    length: 1 + positionBytes.length,
    type: EMessageType.STROKE_POSITION,
    payload: positionBytes,
  };
  const protocolMessage = encodeProtocolMessage(message);
  writeToStream(writer, protocolMessage);
};
