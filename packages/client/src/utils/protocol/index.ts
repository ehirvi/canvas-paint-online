export const EMessageType = {
  USER_AUTHENTICATE: 0x01,
  AUTHENTICATE_SUCCESS: 0x02,
  STROKE_POSITION: 0x03,
} as const;

export type EMessageType = (typeof EMessageType)[keyof typeof EMessageType];

export type TStrokePositionSegment = [number, number, number, number];

export type TMessagePayload = {
  [EMessageType.USER_AUTHENTICATE]: string;
  [EMessageType.STROKE_POSITION]: TStrokePositionSegment;
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

export const encodePositionToBytes = (
  segment: TStrokePositionSegment,
): Uint8Array<ArrayBuffer> => {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);

  view.setUint32(0, segment[0]);
  view.setUint32(4, segment[1]);
  view.setUint32(8, segment[2]);
  view.setUint32(12, segment[3]);

  const bytes = new Uint8Array(buffer);
  return bytes;
};

export const decodePositionBytes = (
  bytes: Uint8Array<ArrayBuffer>,
): TStrokePositionSegment => {
  const view = new DataView(bytes.buffer);

  const lastPosX = view.getUint32(0);
  const lastPosY = view.getUint32(4);
  const posX = view.getUint32(8);
  const posY = view.getUint32(12);

  return [lastPosX, lastPosY, posX, posY];
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
