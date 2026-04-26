export const EMessageType = {
  USER_AUTHENTICATE: 0x01,
  AUTHENTICATE_SUCCESS: 0x02,
  STROKE_SEGMENT: 0x03,
  MOUSE_POSITION: 0x04,
} as const;

export type EMessageType = (typeof EMessageType)[keyof typeof EMessageType];

export type TStrokeSegment = [number, number, number, number, string];
export type TMousePosition = [number, number];

export type TMessagePayload = {
  [EMessageType.USER_AUTHENTICATE]: string;
  [EMessageType.STROKE_SEGMENT]: TStrokeSegment;
};

export interface IMessage {
  /**
   * 4 bytes
   */
  length: number;
  /**
   * 1 byte
   */
  type: EMessageType;
  /**
   * Variable size
   */
  payload: Uint8Array;
}

export const isValidMessageType = (type: number): type is EMessageType => {
  return Object.values(EMessageType).includes(type as EMessageType);
};

export const encodeStringToBytes = (
  message: string,
): Uint8Array<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  return bytes;
};

const decodeBytesToString = (bytes: Uint8Array<ArrayBuffer>): string => {
  const decoder = new TextDecoder();
  const string = decoder.decode(bytes);
  return string;
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

export const decodeBytesToStrokeSegment = (
  bytes: Uint8Array<ArrayBuffer>,
): TStrokeSegment => {
  const view = new DataView(bytes.buffer);

  const lastPosX = view.getUint32(0);
  const lastPosY = view.getUint32(4);
  const posX = view.getUint32(8);
  const posY = view.getUint32(12);

  const color = decodeBytesToString(bytes.slice(16));

  return [lastPosX, lastPosY, posX, posY, color];
};

export const decodeBytesToMousePosition = (
  bytes: Uint8Array<ArrayBuffer>,
): TMousePosition => {
  const view = new DataView(bytes.buffer);

  const posX = view.getUint32(0);
  const posY = view.getUint32(4);

  return [posX, posY];
};

export const encodeProtocolMessage = (
  message: IMessage,
): Uint8Array<ArrayBuffer> => {
  const { length, type, payload } = message;
  const buffer = new ArrayBuffer(4 + length);
  const view = new DataView(buffer);

  view.setUint32(0, length);
  view.setUint8(4, type);

  const protocolMsg = new Uint8Array(buffer);
  protocolMsg.set(payload, 5);

  return protocolMsg;
};

export const decodeProtocolMessage = async (
  reader: ReadableStreamDefaultReader,
  buffer: Uint8Array,
  n: number,
) => {
  while (buffer.length < n) {
    const { value, done } = await reader.read();
    if (done) return null;

    const merged = new Uint8Array(buffer.length + value.length);
    merged.set(buffer);
    merged.set(value, buffer.length);
    buffer = merged;
  }

  const out = buffer.slice(0, n);
  buffer = buffer.slice(n);
  return { out, buffer };
};
