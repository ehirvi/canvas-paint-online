export const EAppRoutes = {
  PAINT_CANVAS: "session/:sessionId",
} as const;

export type EAppRoutes = (typeof EAppRoutes)[keyof typeof EAppRoutes];
