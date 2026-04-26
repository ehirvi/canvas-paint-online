import styled, { keyframes } from "styled-components";
import { Stack } from "../../components/Stack";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { getSessionToken, storeSessionToken } from "../../utils/storage";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { joinSession } from "../../utils/api/session";
import { useWebTransportContext } from "../../hooks/useWebTransportContext";
import type { TStrokeSegment } from "../../utils/protocol";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 960;
const DEFAULT_COLOR = "#000000";

const canvasFadeInAnimation = keyframes`
  from {
      transform: translateY(-25%);
      opacity: 0
  }
  to {
      transform: translateY(0%);
      opacity: 1
  }
`;

const toolbarFadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const AnimatedCanvas = styled.div`
  animation: ${canvasFadeInAnimation} ease-out 500ms 1;
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

const AnimatedToolbar = styled.div`
  animation: ${toolbarFadeInAnimation} 1.5s 1;
`;

const StyledColorPicker = styled.input.attrs({ type: "color" })`
  background-color: white;
  width: 4rem;
  height: 4rem;
  padding: 0.25rem;
  border: none;
  border-radius: 0.5rem;
`;

const Canvas = () => {
  const [pickedColor, setPickedColor] = useState(DEFAULT_COLOR);
  const pickedColorRef = useRef(pickedColor);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>(null);
  const isMousePressedDown = useRef(false);
  const lastPosRef = useRef<[number, number]>(null);
  const { sendStrokeUpdate, getDrawQueue, pushToDrawQueue } =
    useWebTransportContext();

  const getMousePosition = (ev: MouseEvent): [number, number] => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const posX = ev.clientX - rect.left;
    const posY = ev.clientY - rect.top;
    return [posX, posY];
  };

  const onMouseMove = (pos: [number, number]) => {
    if (!isMousePressedDown.current) {
      return;
    }

    const lastPos = lastPosRef.current;
    if (!lastPos) {
      return;
    }

    const payload: TStrokeSegment = [
      lastPos[0],
      lastPos[1],
      pos[0],
      pos[1],
      pickedColorRef.current,
    ];
    pushToDrawQueue(payload);
    sendStrokeUpdate(payload);

    lastPosRef.current = pos;
  };

  const onMouseDown = (pos: [number, number]) => {
    isMousePressedDown.current = true;
    lastPosRef.current = pos;
  };

  const onMouseUp = (pos: [number, number]) => {
    onMouseMove(pos);
    isMousePressedDown.current = false;
    lastPosRef.current = null;
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

  const renderStrokes = () => {
    const queue = getDrawQueue();
    const ctx = ctxRef.current as CanvasRenderingContext2D;
    for (let i = 0; i < queue.length; i++) {
      const pos = queue[i];
      if (!pos) {
        return;
      }

      ctx.strokeStyle = pos[4];
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pos[0], pos[1]);
      ctx.lineTo(pos[2], pos[3]);
      ctx.stroke();
    }
    requestAnimationFrame(renderStrokes);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    let frameId: number;

    if (canvas) {
      ctxRef.current = canvas.getContext("2d");
      const ctx = ctxRef.current as CanvasRenderingContext2D;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      createEventListeners(canvas);
    }

    frameId = requestAnimationFrame(renderStrokes);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    pickedColorRef.current = pickedColor;
  }, [pickedColor]);

  return (
    <Stack gap={2} vertical>
      <AnimatedCanvas>
        <StyledShadow />
        <StyledCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={canvasRef}
        />
      </AnimatedCanvas>
      <AnimatedToolbar>
        <StyledColorPicker
          value={pickedColor}
          onChange={(e) => setPickedColor(e.target.value)}
        />
      </AnimatedToolbar>
    </Stack>
  );
};

export const CanvasWrapper = () => {
  const { sessionId } = useParams();
  const sessionToken = getSessionToken();
  const { isAuthenticated, initWebTransport } = useWebTransportContext();

  useEffect(() => {
    const onJoin = async () => {
      const hasSessionToken = !!sessionToken;

      if (hasSessionToken) {
        return;
      }

      const session = await joinSession(sessionId!);
      if (session) {
        storeSessionToken(session.sessionToken);
        initWebTransport(session.sessionToken);
      }
    };

    onJoin();
  }, []);

  if (!isAuthenticated) {
    return <LoadingIndicator />;
  }

  return <Canvas />;
};
