import { Stack } from "../../components/Stack";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { createSession } from "../../utils/api/session";
import { useState } from "react";
import { useWebTransport } from "../../hooks/useWebTransport";
import type { ISessionCreateResponse } from "../../utils/api/types";

export const Home = () => {
  const [sessionSettings, setSessionSettings] = useState<
    ISessionCreateResponse | undefined
  >(undefined);

  const { isAuthenticated } = useWebTransport(sessionSettings?.accessToken);

  const onCreate = async () => {
    const session = await createSession();
    if (session) {
      setSessionSettings(session);
    }
  };

  return (
    <Stack vertical gap={2}>
      <Heading>Canvas Paint</Heading>
      <Stack vertical gap={2}>
        <Button onClick={onCreate}>Create a new paint session</Button>
        <Button>Join a paint session</Button>
      </Stack>
      <p>{sessionSettings?.sessionId}</p>
      <p>is authenticated {String(isAuthenticated)}</p>
    </Stack>
  );
};
