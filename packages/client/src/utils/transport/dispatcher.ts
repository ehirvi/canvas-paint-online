import { EMessageType, type IMessage, type TMessagePayload } from "../protocol";
import {
  encodeMousePositionToBytes,
  encodeProtocolMessage,
  encodeStringToBytes,
  encodeStrokeSegmentToBytes,
} from "../protocol/encoders";

type TEncoderMap = {
  [K in keyof TMessagePayload]: (
    arg: TMessagePayload[K],
  ) => Uint8Array<ArrayBuffer>;
};

const messagePayloadEncoderMap: TEncoderMap = {
  [EMessageType.USER_AUTHENTICATE]: encodeStringToBytes,
  [EMessageType.STROKE_SEGMENT]: encodeStrokeSegmentToBytes,
  [EMessageType.MOUSE_POSITION]: encodeMousePositionToBytes,
};

export const messageDispatcher = <T extends keyof TMessagePayload>(
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
  writer.write(protocolMessage);
};
