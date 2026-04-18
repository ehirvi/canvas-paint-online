import { createContext, useRef, useState } from "react";
import { EMessageType } from "../utils/protocol";
import {
  authenticateUser,
  createWebTransportConnection,
  readFromStream,
  setupWebTransportStream,
} from "../utils/api/webtransport";

export interface IWebTransportContext {
  connection: WebTransport | null;
  bidirStream: WebTransportBidirectionalStream | null;
  isAuthenticated: boolean;
  initWebTransport: (accessToken: string) => void;
  setIsAuthenticated: (value: React.SetStateAction<boolean>) => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authSuccessHandler = (payload: Uint8Array<ArrayBuffer>) => {
    const value = payload[0];
    setIsAuthenticated(value === 1 ? true : false);
  };

  const messageHandler = (type: number, payload: Uint8Array<ArrayBuffer>) => {
    switch (type) {
      case EMessageType.AUTHENTICATE_SUCCESS:
        authSuccessHandler(payload);
    }
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
        setIsAuthenticated,
      }}
    >
      {children}
    </WebTransportContext>
  );
};
