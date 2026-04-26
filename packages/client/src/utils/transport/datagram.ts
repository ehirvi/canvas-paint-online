import {
  EMessageType,
  encodeProtocolMessage,
  isValidMessageType,
  type IMessage,
  type TMousePosition,
} from "../protocol";

export const readDatagram = async (
  reader: ReadableStreamDefaultReader,
  streamMessageHandler: (
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
      const type = datagram.slice(4, 5)[0];
      const payload = datagram.slice(5);

      if (isValidMessageType(type)) {
        streamMessageHandler(type, payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
};

export const sendDatagram = (
  writer: WritableStreamDefaultWriter,
  payload: Uint8Array<ArrayBuffer>,
) => {
  writer.write(payload);
};

export const dispatchDatagram = (
  writer: WritableStreamDefaultWriter,
  type: EMessageType,
  payload: TMousePosition,
) => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);

  view.setUint32(0, payload[0]);
  view.setUint32(4, payload[1]);
  const bytes = new Uint8Array(buffer);

  const message: IMessage = {
    length: 1 + bytes.length,
    type: type,
    payload: bytes,
  };

  const encoded = encodeProtocolMessage(message);
  sendDatagram(writer, encoded);
};
