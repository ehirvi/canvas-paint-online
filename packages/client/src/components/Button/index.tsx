import styled from "styled-components";

const StyledShadow = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.5rem;
  background-color: #68a162;

  transform: translateY(2px);
  will-change: transform;
  transition: transform 600ms cubic-bezier(0.3, 0.7, 0.4, 1);

  filter: blur(0.4px);
`;

const StyledTop = styled.span`
  display: block;
  position: relative;
  background-color: #9df594;

  font-family: Arial, Helvetica, sans-serif;
  font-size: 1.2rem;

  padding: 0.5rem 1rem;

  border: 1px solid white;
  border-radius: 0.5rem;

  transform: translateY(-4px);
  will-change: transform;
  transition: transform 600ms;
`;

const Root = styled.button`
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  outline-offset: 4px;
  transition: filter 250ms;
  --webkit-tap-highlight-color: transparent;
  user-select: none;

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:hover {
    filter: brightness(110%);

    ${StyledTop} {
      transform: translateY(-4px);
      transition: transform 250ms cubic-bezier(0.3, 0.7, 0.4, 1.5);
    }
  }

  &:active {
    ${StyledTop} {
      transform: translateY(-2px);
      transition: transform 34ms;
    }
    ${StyledShadow} {
      transform: translateY(1px);
      transition: transform 34ms;
    }
  }
`;

type TButtonProps = React.PropsWithChildren & {
  onClick?: () => void;
};

export const Button = ({ onClick, children }: TButtonProps) => {
  return (
    <Root onClick={onClick}>
      <StyledShadow />
      <StyledTop>{children}</StyledTop>
    </Root>
  );
};
