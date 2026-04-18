export const EAppRoutes = {
  CANVAS: "canvas/:sessionId",
} as const;

export type EAppRoutes = (typeof EAppRoutes)[keyof typeof EAppRoutes];

export const constructCanvasRoute = (sessionId: string): string => {
  return EAppRoutes.CANVAS.replace(":sessionId", sessionId);
};
