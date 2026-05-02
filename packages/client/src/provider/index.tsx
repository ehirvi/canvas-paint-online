import { createContext, useContext, useRef, useState } from "react";
import { type TMousePosition, type TStrokeSegment } from "../protocol";

import { useWebTransportConnection } from "../hooks/useWebTransportConnection";

interface IApplicationContext {
  isAuthenticated: boolean;
  initTransport: (sessionToken: string) => void;
  updateStrokeSegmentQueue: (segment: TStrokeSegment) => void;
  updateMousePosition: (position: TMousePosition) => void;
  getStrokeSegmentQueue: () => Array<TStrokeSegment>;
  getPeerMousePosition: () => TMousePosition | null;
}

const ApplicationContext = createContext<IApplicationContext | null>(null);

interface IApplicationContextProviderProps extends React.PropsWithChildren {}

export const ApplicationContextProvider = ({
  children,
}: IApplicationContextProviderProps) => {
  const strokeSegmentQueueRef = useRef<Array<TStrokeSegment>>([]);
  const peerMousePositionRef = useRef<TMousePosition>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { initTransport, sendStrokeSegmentUpdate, sendMousePositionUpdate } =
    useWebTransportConnection({
      strokeSegmentQueueRef,
      peerMousePositionRef,
      setIsAuthenticated,
    });

  const updateStrokeSegmentQueue = (segment: TStrokeSegment) => {
    strokeSegmentQueueRef.current.push(segment);
    sendStrokeSegmentUpdate(segment);
  };

  const updateMousePosition = (position: TMousePosition) => {
    sendMousePositionUpdate(position);
  };

  const getStrokeSegmentQueue = () => {
    const queue = strokeSegmentQueueRef.current;
    strokeSegmentQueueRef.current = [];
    return queue;
  };

  const getPeerMousePosition = () => {
    return peerMousePositionRef.current;
  };

  return (
    <ApplicationContext
      value={{
        isAuthenticated,
        initTransport,
        updateStrokeSegmentQueue,
        updateMousePosition,
        getStrokeSegmentQueue,
        getPeerMousePosition,
      }}
    >
      {children}
    </ApplicationContext>
  );
};

export const useApplicationContext = () => {
  const ctx = useContext(ApplicationContext) as IApplicationContext;
  return ctx;
};
