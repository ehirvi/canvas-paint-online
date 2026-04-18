export const EAppRoutes = {
  PAINT_CANVAS: "session/:sessionId",
} as const;

export type EAppRoutes = (typeof EAppRoutes)[keyof typeof EAppRoutes];

export const constructPaintCanvasRoute = (sessionId: string): string => {
  return EAppRoutes.PAINT_CANVAS.replace(":sessionId", sessionId);
};
