import { useContext } from "react";
import { WebTransportContext, type IWebTransportContext } from "../../provider";

export const useWebTransportContext = () => {
  const ctx = useContext(WebTransportContext) as IWebTransportContext;
  return ctx;
};
