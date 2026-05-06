import {
  COORDINATE_BYTE_SIZE,
  type TMousePosition,
  type TStrokeSegment,
} from ".";

const decodeBytesToString = (bytes: Uint8Array<ArrayBuffer>): string => {
  const decoder = new TextDecoder();
  const string = decoder.decode(bytes);
  return string;
};

export const decodeBytesToStrokeSegment = (
  bytes: Uint8Array<ArrayBuffer>,
): TStrokeSegment => {
  const view = new DataView(bytes.buffer);

  const lastPosX = view.getUint16(COORDINATE_BYTE_SIZE * 0);
  const lastPosY = view.getUint16(COORDINATE_BYTE_SIZE * 1);
  const posX = view.getUint16(COORDINATE_BYTE_SIZE * 2);
  const posY = view.getUint16(COORDINATE_BYTE_SIZE * 3);

  const color = decodeBytesToString(bytes.slice(COORDINATE_BYTE_SIZE * 4));

  return [lastPosX, lastPosY, posX, posY, color];
};

export const decodeBytesToMousePosition = (
  bytes: Uint8Array<ArrayBuffer>,
): TMousePosition => {
  const view = new DataView(bytes.buffer);

  const posX = view.getUint16(COORDINATE_BYTE_SIZE * 0);
  const posY = view.getUint16(COORDINATE_BYTE_SIZE * 1);

  return [posX, posY];
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
