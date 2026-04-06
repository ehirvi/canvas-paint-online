import { Stack } from "../../components/Stack";
import { Button } from "../../components/Button";
import { Heading } from "../../components/Heading";
import { createSession } from "../../utils/api/session";
import { useState } from "react";

export const Home = () => {
  const [sessionId, setSessionId] = useState("");

  const onCreate = async () => {
    const session = await createSession();
    if (session) {
      setSessionId(session.sessionId);
    }
  };

  return (
    <Stack vertical gap={2}>
      <Heading>Canvas Paint</Heading>
      <Stack vertical gap={2}>
        <Button onClick={onCreate}>Create a new paint session</Button>
        <Button>Join a paint session</Button>
      </Stack>
      <p>{sessionId}</p>
    </Stack>
  );
};
