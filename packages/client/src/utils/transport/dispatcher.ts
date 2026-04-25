import {
  EMessageType,
  encodePositionToBytes,
  encodeProtocolMessage,
  encodeStringToBytes,
  type IMessage,
  type TMessagePayload,
} from "../protocol";
import { writeToStream } from "./stream";

type TEncoderMap = {
  [K in keyof TMessagePayload]: (
    arg: TMessagePayload[K],
  ) => Uint8Array<ArrayBuffer>;
};

const messagePayloadEncoderMap: TEncoderMap = {
  [EMessageType.USER_AUTHENTICATE]: encodeStringToBytes,
  [EMessageType.STROKE_POSITION]: encodePositionToBytes,
};

export const streamMessageDispatcher = <T extends keyof TMessagePayload>(
  writer: WritableStreamDefaultWriter,
  type: T,
  payload: TMessagePayload[T],
) => {
  const encoder = messagePayloadEncoderMap[type];
  const bytes = encoder(payload);
  const message: IMessage = {
    length: 1 + bytes.length,
    type,
    payload: bytes,
  };
  const protocolMessage = encodeProtocolMessage(message);
  writeToStream(writer, protocolMessage);
};
