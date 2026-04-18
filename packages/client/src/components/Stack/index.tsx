import type React from "react";
import styled from "styled-components";

const StyledStack = styled.div<{ $vertical?: boolean; $gap?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: ${(p) => (p.$vertical ? "column" : "row")};
  gap: ${(p) => (p.$gap ? p.$gap : 0)}rem;
`;

type TStackProps = React.PropsWithChildren & {
  vertical?: boolean;
  gap?: number;
};

export const Stack = ({ vertical, gap, children }: TStackProps) => {
  return (
    <StyledStack $vertical={vertical} $gap={gap}>
      {children}
    </StyledStack>
  );
};
