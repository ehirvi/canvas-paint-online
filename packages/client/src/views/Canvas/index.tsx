import styled, { keyframes } from "styled-components";
import { Stack } from "../../components/Stack";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { getSessionToken, storeSessionToken } from "../../utils/storage";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { joinSession } from "../../utils/api/session";
import { useWebTransportContext } from "../../hooks/useWebTransportContext";
import type { TStrokeSegment } from "../../utils/protocol";
import PenSvg from "../../assets/pen.svg";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const DEFAULT_COLOR = "#000000";
const PEN_IMAGE = new Image();
PEN_IMAGE.src = PenSvg;

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

const StyledPaintCanvas = styled.canvas`
  position: absolute;
  border-radius: 0.5rem;
`;

const StyledMouseCanvas = styled.canvas`
  position: relative;
  border-radius: 0.5rem;
  pointer-events: none;
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
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const paintCtxRef = useRef<CanvasRenderingContext2D>(null);

  const mouseCanvasRef = useRef<HTMLCanvasElement>(null);
  const mouseCtxRef = useRef<CanvasRenderingContext2D>(null);

  const [pickedColor, setPickedColor] = useState(DEFAULT_COLOR);
  const pickedColorRef = useRef(pickedColor);

  const isMousePressedDown = useRef(false);

  const currentPosRef = useRef<[number, number]>(null);
  const lastPosRef = useRef<[number, number]>(null);

  const {
    sendStrokeUpdate,
    sendMouseUpdate,
    getDrawQueue,
    getMousePositionUpdate,
    pushToDrawQueue,
  } = useWebTransportContext();

  const getMousePosition = (ev: MouseEvent): [number, number] => {
    const canvas = paintCanvasRef.current as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const posX = ev.clientX - rect.left;
    const posY = ev.clientY - rect.top;
    return [posX, posY];
  };

  const onMouseMove = (pos: [number, number]) => {
    currentPosRef.current = pos;
    sendMouseUpdate(pos);

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
    const mousePos = getMousePositionUpdate();

    if (mousePos) {
      const mouseCtx = mouseCtxRef.current as CanvasRenderingContext2D;
      mouseCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      mouseCtx.drawImage(PEN_IMAGE, mousePos[0] - 5, mousePos[1] - 25, 30, 30);
    }

    const paintCtx = paintCtxRef.current as CanvasRenderingContext2D;

    for (let i = 0; i < queue.length; i++) {
      const pos = queue[i];
      if (!pos) {
        return;
      }

      paintCtx.strokeStyle = pos[4];
      paintCtx.lineWidth = 5;
      paintCtx.lineCap = "round";
      paintCtx.lineJoin = "round";
      paintCtx.beginPath();
      paintCtx.moveTo(pos[0], pos[1]);
      paintCtx.lineTo(pos[2], pos[3]);
      paintCtx.stroke();
    }
    requestAnimationFrame(renderStrokes);
  };

  useEffect(() => {
    const paintCanvas = paintCanvasRef.current;
    const mouseCanvas = mouseCanvasRef.current;
    let frameId: number;

    if (paintCanvas && mouseCanvas) {
      paintCtxRef.current = paintCanvas.getContext("2d");
      mouseCtxRef.current = mouseCanvas.getContext("2d");

      const paintCtx = paintCtxRef.current as CanvasRenderingContext2D;
      paintCtx.fillStyle = "white";
      paintCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      createEventListeners(paintCanvas);
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
    <Stack gap={1} vertical>
      <AnimatedCanvas>
        <StyledShadow />
        <StyledPaintCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={paintCanvasRef}
        />
        <StyledMouseCanvas
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={mouseCanvasRef}
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
