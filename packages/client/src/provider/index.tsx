import { createContext, useRef, useState } from "react";
import {
  decodeBytesToMousePosition,
  decodeBytesToStrokeSegment,
  EMessageType,
  type TMousePosition,
  type TStrokeSegment,
} from "../utils/protocol";
import { streamMessageDispatcher } from "../utils/transport/dispatcher";
import {
  createWebTransportConnection,
  setupWebTransportDatagrams,
  setupWebTransportStream,
} from "../utils/transport/connection";
import { readFromStream } from "../utils/transport/stream";
import { dispatchDatagram, readDatagram } from "../utils/transport/datagram";

export interface IWebTransportContext {
  connection: WebTransport | null;
  bidirStream: WebTransportBidirectionalStream | null;
  isAuthenticated: boolean;
  initWebTransport: (sessionToken: string) => void;
  sendStrokeUpdate: (segment: TStrokeSegment) => void;
  sendMouseUpdate: (position: TMousePosition) => void;
  getMousePositionUpdate: () => TMousePosition | null;
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
  const streamWriterRef = useRef<WritableStreamDefaultWriter>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader>(null);

  const datagramWriterRef = useRef<WritableStreamDefaultWriter>(null);
  const datagramReaderRef = useRef<ReadableStreamDefaultReader>(null);

  const drawQueueRef = useRef<Array<TStrokeSegment>>([]);
  const mousePoisitionRef = useRef<TMousePosition>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authSuccessHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const value = payload[0];
    setIsAuthenticated(value === 1 ? true : false);
  };

  const strokeSegmentHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const segment = decodeBytesToStrokeSegment(payload);
    drawQueueRef.current.push(segment);
  };

  const mousePositionHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const pos = decodeBytesToMousePosition(payload);
    mousePoisitionRef.current = pos;
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
      case EMessageType.MOUSE_POSITION:
        mousePositionHandler(payload);
        break;
    }
  };

  const authenticateUser = (sessionToken: string) => {
    streamMessageDispatcher(
      streamWriterRef.current!,
      EMessageType.USER_AUTHENTICATE,
      sessionToken,
    );
  };

  const sendStrokeUpdate = (segment: TStrokeSegment) => {
    streamMessageDispatcher(
      streamWriterRef.current!,
      EMessageType.STROKE_SEGMENT,
      segment,
    );
  };

  const sendMouseUpdate = (position: TMousePosition) => {
    dispatchDatagram(
      datagramWriterRef.current!,
      EMessageType.MOUSE_POSITION,
      position,
    );
  };

  const getDrawQueue = () => {
    const queue = drawQueueRef.current;
    drawQueueRef.current = [];
    return queue;
  };

  const getMousePositionUpdate = () => {
    return mousePoisitionRef.current;
  };

  const pushToDrawQueue = (segment: TStrokeSegment) => {
    drawQueueRef.current.push(segment);
  };

  const initWebTransport = async (sessionToken: string) => {
    const wt = await createWebTransportConnection();
    connectionRef.current = wt;

    const stream = await setupWebTransportStream(wt);
    streamRef.current = stream;
    streamWriterRef.current = stream.writable.getWriter();
    streamReaderRef.current = stream.readable.getReader();

    const datagrams = setupWebTransportDatagrams(wt);
    datagramWriterRef.current = datagrams.writable.getWriter();
    datagramReaderRef.current = datagrams.readable.getReader();

    authenticateUser(sessionToken);

    readFromStream(streamReaderRef.current, streamMessageHandler);
    readDatagram(datagramReaderRef.current, streamMessageHandler);
  };

  return (
    <WebTransportContext
      value={{
        connection: connectionRef.current,
        bidirStream: streamRef.current,
        isAuthenticated,
        initWebTransport,
        sendStrokeUpdate,
        sendMouseUpdate,
        getDrawQueue,
        getMousePositionUpdate,
        pushToDrawQueue,
      }}
    >
      {children}
    </WebTransportContext>
  );
};
