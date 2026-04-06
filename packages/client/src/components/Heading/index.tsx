import styled from "styled-components";

const StyledHeading = styled.h1`
  font-family: Arial, Helvetica, sans-serif;
`;

type THeadingProps = React.PropsWithChildren;

export const Heading = ({ children }: THeadingProps) => {
  return <StyledHeading>{children}</StyledHeading>;
};
