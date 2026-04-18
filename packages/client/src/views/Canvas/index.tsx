import styled, { keyframes } from "styled-components";
import { Stack } from "../../components/Stack";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import { getAccessToken, setAccessToken } from "../../utils/storage";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { joinSession } from "../../utils/api/session";
import { useWebTransportContext } from "../../hooks/useWebTransportContext";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 960;

const fadeInAnimation = keyframes`
  from {
      transform: translateY(-25%);
      opacity: 0
  }
  to {
      transform: translateY(0%);
      opacity: 1
  }
`;

const AnimatedRoot = styled.div`
  animation: ${fadeInAnimation} ease-out 500ms 1;
`;

const StyledShadow = styled.div`
  background-color: #915a33;
  width: ${CANVAS_WIDTH}px;
  height: ${CANVAS_HEIGHT}px;
  border-radius: 0.5rem;
  position: absolute;
  transform: translateY(0.5rem);
`;

const StyledCanvas = styled.canvas`
  position: relative;
  border-radius: 0.5rem;
`;

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>(null);
  const isMousePressedDown = useRef(false);

  const getMousePosition = (ev: MouseEvent): [number, number] => {
    const ctx = canvasRef.current as HTMLCanvasElement;
    const rect = ctx.getBoundingClientRect();
    const posX = ev.clientX - rect.left;
    const posY = ev.clientY - rect.top;
    return [posX, posY];
  };

  const onMouseMove = (pos: [number, number]) => {
    if (isMousePressedDown.current) {
      const ctx = ctxRef.current as CanvasRenderingContext2D;
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 5;
      ctx.lineTo(pos[0], pos[1]);
      ctx.stroke();
    }
  };

  const onMouseDown = (pos: [number, number]) => {
    isMousePressedDown.current = true;
    const ctx = ctxRef.current as CanvasRenderingContext2D;
    ctx.beginPath();
    ctx.moveTo(pos[0], pos[1]);
  };

  const onMouseUp = (pos: [number, number]) => {
    onMouseMove(pos);
    isMousePressedDown.current = false;
  };

  const createEventListeners = (canvas: HTMLCanvasElement) => {
    canvas.addEventListener("mousemove", (ev) =>
      onMouseMove(getMousePosition(ev)),
    );
    canvas.addEventListener("mousedown", (ev) =>
      onMouseDown(getMousePosition(ev)),
    );
    canvas.addEventListener("mouseup", (ev) => onMouseUp(getMousePosition(ev)));
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      ctxRef.current = canvas.getContext("2d");
      const ctx = ctxRef.current as CanvasRenderingContext2D;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      createEventListeners(canvas);
    }
  }, []);

  return (
    <Stack>
      <AnimatedRoot>
        <StyledShadow />
        <StyledCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={canvasRef}
        />
      </AnimatedRoot>
    </Stack>
  );
};

export const CanvasWrapper = () => {
  const { sessionId } = useParams();
  const accessToken = getAccessToken();
  const { isAuthenticated, initWebTransport } = useWebTransportContext();

  useEffect(() => {
    const onJoin = async () => {
      const hasAccessToken = !!accessToken;

      if (hasAccessToken) {
        return;
      }

      const session = await joinSession(sessionId!);
      if (session) {
        setAccessToken(session.accessToken);
        initWebTransport(session.accessToken);
      }
    };

    onJoin();
  }, []);

  if (!isAuthenticated) {
    return <LoadingIndicator />;
  }

  return <Canvas />;
};
