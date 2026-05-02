import { EMessageType, isValidMessageType } from "../protocol";

export const readDatagram = async (
  reader: ReadableStreamDefaultReader,
  messageReceiver: (
    type: EMessageType,
    payload: Uint8Array<ArrayBuffer>,
  ) => void,
) => {
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const datagram = value as Uint8Array;
      const type = datagram[0];
      const payload = datagram.slice(5);

      if (isValidMessageType(type)) {
        messageReceiver(type, payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
};
