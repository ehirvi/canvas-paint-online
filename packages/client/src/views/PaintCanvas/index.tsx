import { useParams } from "react-router";
import { getAccessToken } from "../../utils/storage";

export const PaintCanvas = () => {
  const { sessionId } = useParams();
  const accessToken = getAccessToken();
  return (
    <>
      <p>paint canvas</p>
      <p>sessionId: {sessionId}</p>
      <p>accessToken: {accessToken}</p>
    </>
  );
};
