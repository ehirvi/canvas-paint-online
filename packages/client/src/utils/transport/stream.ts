import {
  decodeProtocolMessage,
  isValidMessageType,
  type EMessageType,
} from "../protocol";

export const readFromStream = async (
  reader: ReadableStreamDefaultReader,
  streamMessageHandler: (
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
        streamMessageHandler(type, payload);
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
