import { useRef } from "react";
import {
  createWebTransportConnection,
  setupWebTransportDatagrams,
  setupWebTransportStream,
} from "../../transport/connection";
import { readStream } from "../../transport/stream";
import { readDatagram } from "../../transport/datagram";
import { messageDispatcher } from "../../transport/dispatcher";
import {
  EMessageType,
  type TMousePosition,
  type TStrokeSegment,
} from "../../protocol";
import {
  decodeBytesToMousePosition,
  decodeBytesToStrokeSegment,
} from "../../protocol/decoders";

type TUseWebTransportConnectionParams = {
  strokeSegmentQueueRef: React.RefObject<TStrokeSegment[]>;
  peerMousePositionRef: React.RefObject<TMousePosition | null>;
  setIsAuthenticated: (value: boolean) => void;
};

export const useWebTransportConnection = ({
  strokeSegmentQueueRef,
  peerMousePositionRef,
  setIsAuthenticated,
}: TUseWebTransportConnectionParams) => {
  const connectionRef = useRef<WebTransport>(null);

  const streamRef = useRef<WebTransportBidirectionalStream>(null);
  const streamWriterRef = useRef<WritableStreamDefaultWriter>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader>(null);

  const datagramWriterRef = useRef<WritableStreamDefaultWriter>(null);
  const datagramReaderRef = useRef<ReadableStreamDefaultReader>(null);

  const authSuccessHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const value = payload[0];
    setIsAuthenticated(value === 1 ? true : false);
  };

  const strokeSegmentHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const segment = decodeBytesToStrokeSegment(payload);
    strokeSegmentQueueRef.current.push(segment);
  };

  const mousePositionHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const pos = decodeBytesToMousePosition(payload);
    peerMousePositionRef.current = pos;
  };

  const messageReceiver = (
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
    messageDispatcher(
      streamWriterRef.current!,
      EMessageType.USER_AUTHENTICATE,
      sessionToken,
    );
  };

  const sendStrokeSegmentUpdate = (segment: TStrokeSegment) => {
    messageDispatcher(
      streamWriterRef.current!,
      EMessageType.STROKE_SEGMENT,
      segment,
    );
  };

  const sendMousePositionUpdate = (position: TMousePosition) => {
    messageDispatcher(
      datagramWriterRef.current!,
      EMessageType.MOUSE_POSITION,
      position,
    );
  };

  const initTransport = async (sessionToken: string) => {
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

    readStream(streamReaderRef.current, messageReceiver);
    readDatagram(datagramReaderRef.current, messageReceiver);
  };

  return {
    initTransport,
    sendStrokeSegmentUpdate,
    sendMousePositionUpdate,
  };
};
