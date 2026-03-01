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

export const SwipeEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type SwipeEventPointerType =
  (typeof SwipeEventPointerTypes)[keyof typeof SwipeEventPointerTypes];

export interface SwipeOptions {
  eventPointerTypes: SwipeEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  threshold: number;
  velocity: number;
  container: { current: EventTarget | null };
}

export interface SwipeData {
  deltaX: number;
  deltaY: number;
  velocity: number;
  duration: number;
}

export type UseSwipeSchema = SwipeDirection | SwipeDirection[];

export type UseSwipeCallback =
  | ((
      event: PointerEvent,
      direction: SwipeDirection,
      data: SwipeData,
      ...properties: unknown[]
    ) => boolean)
  | ((
      event: PointerEvent,
      direction: SwipeDirection,
      data: SwipeData,
      ...properties: unknown[]
    ) => void);

export type UseSwipeOptions = Partial<SwipeOptions>;
