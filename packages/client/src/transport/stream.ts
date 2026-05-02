import { isValidMessageType, type EMessageType } from "../protocol";
import { decodeProtocolMessage } from "../protocol/decoders";

export const readStream = async (
  reader: ReadableStreamDefaultReader,
  messageReceiver: (
    type: EMessageType,
    payload: Uint8Array<ArrayBuffer>,
  ) => void,
) => {
  let buffer = new Uint8Array(0);
  try {
    while (true) {
      const typeBuf = await decodeProtocolMessage(reader, buffer, 1);

      if (!typeBuf) return;

      const lenBuf = await decodeProtocolMessage(reader, typeBuf.buffer, 4);

      if (!lenBuf) return;

      const length = new DataView(lenBuf.out.buffer).getUint32(0);

      const payloadBuf = await decodeProtocolMessage(
        reader,
        lenBuf.buffer,
        length,
      );

      if (!payloadBuf) return;

      const type = typeBuf.out[0];
      const payload = payloadBuf.out;

      if (isValidMessageType(type)) {
        messageReceiver(type, payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
};
