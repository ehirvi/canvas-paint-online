import { isObject, isString } from "../utils/typeguards";
import type { ISessionResponse } from "./types";

export const isSessionResponse = (data: unknown): data is ISessionResponse => {
  return (
    isObject(data) && "sessionToken" in data && isString(data.sessionToken)
  );
};
