import { useEffect, useState } from "react";
import {
  authenticateUser,
  createWebTransportConnection,
  readFromStream,
  setupWebTransportStream,
} from "../../utils/api/webtransport";
import { EMessageType } from "../../utils/protocol";

export const useWebTransport = (accessToken: string | undefined) => {
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

  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        const wt = await createWebTransportConnection();
        const stream = await setupWebTransportStream(wt);
        authenticateUser(stream.writable, accessToken);
        await readFromStream(stream.readable, messageHandler);
      }
    };

    init();
  }, [accessToken]);

  return { isAuthenticated };
};
