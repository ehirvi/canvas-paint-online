import type React from "react";
import styled from "styled-components";

const StyledStack = styled.div<{ $vertical?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: ${(p) => p.$vertical ? "column" : "row"
  };
`;

type TStackProps = React.PropsWithChildren & {
  vertical?: boolean
};

export const Stack = ({ vertical, children }: TStackProps) => {
  return <StyledStack $vertical={vertical}>{children}</StyledStack>;
};
