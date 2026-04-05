import { Stack } from "../../components/Stack";
import { Button } from "../../components/Button";

export const Home = () => {
  const onCreate = () => {};

  return (
    <Stack vertical>
      <p>Canvas Paint</p>
      <Stack vertical>
        <Button onClick={onCreate}>Create a new paint session</Button>
        <Button>Join a paint session</Button>
      </Stack>
    </Stack>
  );
};
