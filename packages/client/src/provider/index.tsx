import { createContext, useRef, useState } from "react";
import { decodePositionBytes, EMessageType } from "../utils/protocol";
import {
  authenticateUser,
  createWebTransportConnection,
  readFromStream,
  setupWebTransportStream,
  updateUserStrokePosition,
} from "../utils/api/webtransport";

export type TStrokePositionSegment = [number, number, number, number];

export interface IWebTransportContext {
  connection: WebTransport | null;
  bidirStream: WebTransportBidirectionalStream | null;
  isAuthenticated: boolean;
  initWebTransport: (accessToken: string) => void;
  sendPositionUpdate: (segment: TStrokePositionSegment) => void;
  getDrawQueue: () => Array<TStrokePositionSegment>;
  pushToDrawQueue: (segment: TStrokePositionSegment) => void;
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
  const drawQueueRef = useRef<Array<TStrokePositionSegment>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authSuccessHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const value = payload[0];
    setIsAuthenticated(value === 1 ? true : false);
  };

  const positionUpdateHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const pos = decodePositionBytes(payload);
    drawQueueRef.current.push(pos);
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
        positionUpdateHandler(payload);
        break;
    }
  };

  const sendPositionUpdate = (segment: TStrokePositionSegment) => {
    updateUserStrokePosition(writerRef.current!, segment);
  };

  const getDrawQueue = () => {
    const queue = drawQueueRef.current;
    drawQueueRef.current = [];
    return queue;
  };

  const pushToDrawQueue = (segment: TStrokePositionSegment) => {
    drawQueueRef.current.push(segment);
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
        sendPositionUpdate,
        getDrawQueue,
        pushToDrawQueue,
      }}
    >
      {children}
    </WebTransportContext>
  );
};
