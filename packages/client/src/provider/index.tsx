import { createContext, useRef, useState } from "react";
import {
  decodePositionBytes,
  EMessageType,
  type TStrokePositionSegment,
} from "../utils/protocol";
import { streamMessageDispatcher } from "../utils/transport/dispatcher";
import {
  createWebTransportConnection,
  setupWebTransportStream,
} from "../utils/transport/connection";
import { readFromStream } from "../utils/transport/stream";

export interface IWebTransportContext {
  connection: WebTransport | null;
  bidirStream: WebTransportBidirectionalStream | null;
  isAuthenticated: boolean;
  initWebTransport: (sessionToken: string) => void;
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

  const streamMessageHandler = (
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

  const authenticateUser = (sessionToken: string) => {
    streamMessageDispatcher(
      writerRef.current!,
      EMessageType.USER_AUTHENTICATE,
      sessionToken,
    );
  };

  const sendPositionUpdate = (segment: TStrokePositionSegment) => {
    streamMessageDispatcher(
      writerRef.current!,
      EMessageType.STROKE_POSITION,
      segment,
    );
  };

  const getDrawQueue = () => {
    const queue = drawQueueRef.current;
    drawQueueRef.current = [];
    return queue;
  };

  const pushToDrawQueue = (segment: TStrokePositionSegment) => {
    drawQueueRef.current.push(segment);
  };

  const initWebTransport = async (sessionToken: string) => {
    const wt = await createWebTransportConnection();
    connectionRef.current = wt;

    const stream = await setupWebTransportStream(wt);
    streamRef.current = stream;

    writerRef.current = stream.writable.getWriter();
    readerRef.current = stream.readable.getReader();

    authenticateUser(sessionToken);
    await readFromStream(readerRef.current, streamMessageHandler);
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
