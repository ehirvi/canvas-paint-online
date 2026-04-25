import { Stack } from "../../components/Stack";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { createSession } from "../../utils/api/session";
import { useEffect, useState } from "react";
import type { ISessionCreateResponse } from "../../utils/api/types";
import { useNavigate } from "react-router";
import { constructCanvasRoute } from "../../utils/routes";
import { storeAccessToken } from "../../utils/storage";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { useWebTransportContext } from "../../hooks/useWebTransportContext";

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] =
    useState<ISessionCreateResponse["sessionId"]>("");

  const { isAuthenticated, initWebTransport } = useWebTransportContext();

  useEffect(() => {
    if (isAuthenticated && sessionId) {
      navigate(constructCanvasRoute(sessionId));
    }
  }, [isAuthenticated]);

  const onCreate = async () => {
    setLoading(true);
    const session = await createSession();
    if (session) {
      storeAccessToken(session.accessToken);
      initWebTransport(session.accessToken);
      setSessionId(session.sessionId);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <Stack vertical gap={2}>
      <Heading>Canvas Paint</Heading>
      <Stack vertical gap={2}>
        <Button onClick={onCreate}>Create a new paint session</Button>
      </Stack>
    </Stack>
  );
};
