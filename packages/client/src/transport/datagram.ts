import {
  EMessageType,
  isValidMessageType,
  MESSAGE_PAYLOAD_BYTE_OFFSET,
  MESSAGE_TYPE_BYTE_OFFSET,
} from "../protocol";

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
      const type = datagram[MESSAGE_TYPE_BYTE_OFFSET];
      const payload = datagram.slice(MESSAGE_PAYLOAD_BYTE_OFFSET);

      if (isValidMessageType(type)) {
        messageReceiver(type, payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
};
