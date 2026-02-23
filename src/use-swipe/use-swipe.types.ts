export const SwipeDirections = {
  Left: "left",
  Right: "right",
  Up: "up",
  Down: "down",
  Horizontal: "horizontal",
  Vertical: "vertical",
  Both: "both",
} as const;

export type SwipeDirection =
  (typeof SwipeDirections)[keyof typeof SwipeDirections];

export interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  active: boolean;
}

export interface SwipeOptions {
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  threshold: number;
  velocity: number;
  container: { current: HTMLElement | null };
}

export interface SwipeData {
  direction: SwipeDirection;
  deltaX: number;
  deltaY: number;
  velocity: number;
  duration: number;
}

export type UseSwipeSchema = SwipeDirection | SwipeDirection[];

export type UseSwipeCallback =
  | ((event: TouchEvent, data: SwipeData, ...properties: unknown[]) => boolean)
  | ((event: TouchEvent, data: SwipeData, ...properties: unknown[]) => void);

export type UseSwipeOptions = Partial<SwipeOptions>;
