import {
  COORDINATE_BYTE_SIZE,
  MESSAGE_LENGTH_BYTE_OFFSET,
  MESSAGE_LENGTH_BYTE_SIZE,
  MESSAGE_PAYLOAD_BYTE_OFFSET,
  MESSAGE_TYPE_BYTE_OFFSET,
  MESSAGE_TYPE_BYTE_SIZE,
  type IMessage,
  type TMousePosition,
  type TStrokeSegment,
} from ".";

export const encodeStringToBytes = (
  message: string,
): Uint8Array<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  return bytes;
};

export const encodeStrokeSegmentToBytes = (
  segment: TStrokeSegment,
): Uint8Array<ArrayBuffer> => {
  const color = encodeStringToBytes(segment[4]);
  const buffer = new ArrayBuffer(COORDINATE_BYTE_SIZE * 4 + color.length);
  const view = new DataView(buffer);

  view.setUint16(COORDINATE_BYTE_SIZE * 0, segment[0]);
  view.setUint16(COORDINATE_BYTE_SIZE * 1, segment[1]);
  view.setUint16(COORDINATE_BYTE_SIZE * 2, segment[2]);
  view.setUint16(COORDINATE_BYTE_SIZE * 3, segment[3]);

  const bytes = new Uint8Array(buffer);
  bytes.set(color, COORDINATE_BYTE_SIZE * 4);
  return bytes;
};

export const encodeMousePositionToBytes = (
  position: TMousePosition,
): Uint8Array<ArrayBuffer> => {
  const buffer = new ArrayBuffer(COORDINATE_BYTE_SIZE * 2);
  const view = new DataView(buffer);

  view.setUint16(COORDINATE_BYTE_SIZE * 0, position[0]);
  view.setUint16(COORDINATE_BYTE_SIZE * 1, position[1]);

  const bytes = new Uint8Array(buffer);
  return bytes;
};

export const encodeProtocolMessage = (
  message: IMessage,
): Uint8Array<ArrayBuffer> => {
  const { length, type, payload } = message;
  const buffer = new ArrayBuffer(
    MESSAGE_TYPE_BYTE_SIZE + MESSAGE_LENGTH_BYTE_SIZE + length,
  );
  const view = new DataView(buffer);

  view.setUint8(MESSAGE_TYPE_BYTE_OFFSET, type);
  view.setUint16(MESSAGE_LENGTH_BYTE_OFFSET, length);

  const protocolMsg = new Uint8Array(buffer);
  protocolMsg.set(payload, MESSAGE_PAYLOAD_BYTE_OFFSET);

  return protocolMsg;
};
