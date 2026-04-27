export const EMessageType = {
  USER_AUTHENTICATE: 0x01,
  AUTHENTICATE_SUCCESS: 0x02,
  STROKE_SEGMENT: 0x03,
  MOUSE_POSITION: 0x04,
} as const;

export type EMessageType = (typeof EMessageType)[keyof typeof EMessageType];

export type TStrokeSegment = [number, number, number, number, string];
export type TMousePosition = [number, number];

export type TMessagePayload = {
  [EMessageType.USER_AUTHENTICATE]: string;
  [EMessageType.STROKE_SEGMENT]: TStrokeSegment;
  [EMessageType.MOUSE_POSITION]: TMousePosition;
};

export interface IMessage {
  /**
   * 4 bytes
   */
  length: number;
  /**
   * 1 byte
   */
  type: EMessageType;
  /**
   * Variable size
   */
  payload: Uint8Array;
}

const VALID_MESSAGE_TYPES = Object.values(EMessageType);

export const isValidMessageType = (type: number): type is EMessageType => {
  return VALID_MESSAGE_TYPES.includes(type as EMessageType);
};
