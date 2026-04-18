import { Stack } from "../../components/Stack";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { createSession } from "../../utils/api/session";
import { useEffect, useState } from "react";
import { useWebTransport } from "../../hooks/useWebTransport";
import type { ISessionCreateResponse } from "../../utils/api/types";
import { useNavigate } from "react-router";
import { constructPaintCanvasRoute } from "../../utils/routes";
import { setAccessToken } from "../../utils/storage";
import { LoadingIndicator } from "../../components/LoadingIndicator";

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionSettings, setSessionSettings] = useState<
    ISessionCreateResponse | undefined
  >(undefined);

  const { isAuthenticated } = useWebTransport(sessionSettings?.accessToken);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(constructPaintCanvasRoute(sessionSettings!.sessionId));
    }
  }, [isAuthenticated]);

  const onCreate = async () => {
    setLoading(true);
    const session = await createSession();
    if (session) {
      setAccessToken(session.accessToken);
      setSessionSettings(session);
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
        <Button>Join a paint session</Button>
      </Stack>
    </Stack>
  );
};
