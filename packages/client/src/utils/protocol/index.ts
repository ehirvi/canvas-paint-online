export const EMessageType = {
  USER_AUTHENTICATE: 0x01,
  AUTHENTICATE_SUCCESS: 0x02,
} as const;

export type EMessageType = (typeof EMessageType)[keyof typeof EMessageType];

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
  message: Uint8Array;
}

export const isValidMessageType = (type: number) => {
  return Object.values(EMessageType).includes(type as EMessageType);
};

export const encodeStringToBytes = (
  message: string,
): Uint8Array<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  return bytes;
};

export const encodeProtocolMessage = (
  payload: IMessage,
): Uint8Array<ArrayBuffer> => {
  const { length, type, message } = payload;
  const buffer = new ArrayBuffer(4 + length);
  const view = new DataView(buffer);

  view.setUint32(0, length);
  view.setUint8(4, type);

  const protocolMsg = new Uint8Array(buffer);
  protocolMsg.set(message, 5);

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
