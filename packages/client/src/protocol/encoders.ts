import {
  MESSAGE_LENGTH_BYTES,
  MESSAGE_TYPE_BYTES,
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
  const buffer = new ArrayBuffer(16 + color.length);
  const view = new DataView(buffer);

  view.setUint32(0, segment[0]);
  view.setUint32(4, segment[1]);
  view.setUint32(8, segment[2]);
  view.setUint32(12, segment[3]);

  const bytes = new Uint8Array(buffer);
  bytes.set(color, 16);
  return bytes;
};

export const encodeMousePositionToBytes = (
  position: TMousePosition,
): Uint8Array<ArrayBuffer> => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);

  view.setUint32(0, position[0]);
  view.setUint32(4, position[1]);

  const bytes = new Uint8Array(buffer);
  return bytes;
};

export const encodeProtocolMessage = (
  message: IMessage,
): Uint8Array<ArrayBuffer> => {
  const { length, type, payload } = message;
  const buffer = new ArrayBuffer(
    MESSAGE_TYPE_BYTES + MESSAGE_LENGTH_BYTES + length,
  );
  const view = new DataView(buffer);

  view.setUint8(0, type);
  view.setUint32(1, length);

  const protocolMsg = new Uint8Array(buffer);
  protocolMsg.set(payload, 5);

  return protocolMsg;
};
