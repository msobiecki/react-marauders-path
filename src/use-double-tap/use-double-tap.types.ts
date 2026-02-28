export const DoubleTapEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type DoubleTapEventPointerType =
  (typeof DoubleTapEventPointerTypes)[keyof typeof DoubleTapEventPointerTypes];

export interface DoubleTapData {
  x: number;
  y: number;
}

export interface DoubleTapOptions {
  eventPointerTypes: DoubleTapEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  delay: number;
  threshold: number;
  container: { current: EventTarget | null };
}

export type UseDoubleTapCallback =
  | ((event: PointerEvent, data: DoubleTapData) => boolean)
  | ((event: PointerEvent, data: DoubleTapData) => void);

export type UseDoubleTapOptions = Partial<DoubleTapOptions>;
