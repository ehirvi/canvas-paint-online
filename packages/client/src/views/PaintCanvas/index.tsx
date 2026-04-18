import styled, { keyframes } from "styled-components";
import { Stack } from "../../components/Stack";
import { useEffect, useRef } from "react";

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

export const PaintCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
