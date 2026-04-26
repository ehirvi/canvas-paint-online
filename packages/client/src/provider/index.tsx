import { createContext, useRef, useState } from "react";
import {
  decodeBytesToStrokeSegment,
  EMessageType,
  type TStrokeSegment,
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
  sendStrokeUpdate: (segment: TStrokeSegment) => void;
  getDrawQueue: () => Array<TStrokeSegment>;
  pushToDrawQueue: (segment: TStrokeSegment) => void;
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
  const drawQueueRef = useRef<Array<TStrokeSegment>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authSuccessHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const value = payload[0];
    setIsAuthenticated(value === 1 ? true : false);
  };

  const strokeSegmentHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const pos = decodeBytesToStrokeSegment(payload);
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
      case EMessageType.STROKE_SEGMENT:
        strokeSegmentHandler(payload);
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

  const sendStrokeUpdate = (segment: TStrokeSegment) => {
    streamMessageDispatcher(
      writerRef.current!,
      EMessageType.STROKE_SEGMENT,
      segment,
    );
  };

  const getDrawQueue = () => {
    const queue = drawQueueRef.current;
    drawQueueRef.current = [];
    return queue;
  };

  const pushToDrawQueue = (segment: TStrokeSegment) => {
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
        sendStrokeUpdate,
        getDrawQueue,
        pushToDrawQueue,
      }}
    >
      {children}
    </WebTransportContext>
  );
};
