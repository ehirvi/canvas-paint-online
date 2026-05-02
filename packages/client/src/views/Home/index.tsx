import { Stack } from "../../components/Stack";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { createSession } from "../../utils/api/session";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { constructCanvasRoute } from "../../utils/routes";
import { storeSessionToken } from "../../utils/storage";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { useWebTransportContext } from "../../hooks/useWebTransportContext";
import { getSessionId } from "../../utils/token";

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();

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
      const sessionId = getSessionId(session.sessionToken);
      storeSessionToken(session.sessionToken);
      initWebTransport(session.sessionToken);
      setSessionId(sessionId);
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
