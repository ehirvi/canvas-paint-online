export const EMessageType = {
  USER_AUTHENTICATE: 0x01,
  AUTHENTICATE_SUCCESS: 0x02,
} as const;

export type EMessageType = (typeof EMessageType)[keyof typeof EMessageType];

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
  message: Uint8Array;
}
