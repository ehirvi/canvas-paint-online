import { createContext, useRef, useState } from "react";
import { decodePositionBytes, EMessageType } from "../utils/protocol";
import {
  authenticateUser,
  createWebTransportConnection,
  readFromStream,
  setupWebTransportStream,
  updateUserStrokePosition,
} from "../utils/api/webtransport";

export interface IWebTransportContext {
  connection: WebTransport | null;
  bidirStream: WebTransportBidirectionalStream | null;
  isAuthenticated: boolean;
  initWebTransport: (accessToken: string) => void;
  sendStrokeUpdate: (segment: [number, number, number, number]) => void;
  getPositionBuffer: () => Array<[number, number, number, number]>;
}

export const WebTransportContext = createContext<IWebTransportContext | null>(
  null,
);

interface IWebTransportProviderProps extends React.PropsWithChildren {}

export const WebTransportProvider = ({
  children,
}: IWebTransportProviderProps) => {
  const connectionRef = useRef<WebTransport>(null);
  const streamRef = useRef<WebTransportBidirectionalStream>(null);
  const writerRef = useRef<WritableStreamDefaultWriter>(null);
  const readerRef = useRef<ReadableStreamDefaultReader>(null);
  const posBufferRef = useRef<Array<[number, number, number, number]>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authSuccessHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const value = payload[0];
    setIsAuthenticated(value === 1 ? true : false);
  };

  const strokePositionHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const pos = decodePositionBytes(payload);
    posBufferRef.current?.push(pos);
  };

  const messageHandler = (
    type: EMessageType,
    payload: Uint8Array<ArrayBuffer>,
  ) => {
    switch (type) {
      case EMessageType.AUTHENTICATE_SUCCESS:
        authSuccessHandler(payload);
        break;
      case EMessageType.STROKE_POSITION:
        strokePositionHandler(payload);
        break;
    }
  };

  const sendStrokeUpdate = (segment: [number, number, number, number]) => {
    updateUserStrokePosition(writerRef.current!, segment);
  };

  const getPositionBuffer = () => {
    return posBufferRef.current;
  };

  const initWebTransport = async (accessToken: string) => {
    const wt = await createWebTransportConnection();
    connectionRef.current = wt;

    const stream = await setupWebTransportStream(wt);
    streamRef.current = stream;

    writerRef.current = stream.writable.getWriter();
    readerRef.current = stream.readable.getReader();

    authenticateUser(writerRef.current, accessToken);
    await readFromStream(readerRef.current, messageHandler);
  };

  return (
    <WebTransportContext
      value={{
        connection: connectionRef.current,
        bidirStream: streamRef.current,
        isAuthenticated,
        initWebTransport,
        sendStrokeUpdate,
        getPositionBuffer,
      }}
    >
      {children}
    </WebTransportContext>
  );
};
