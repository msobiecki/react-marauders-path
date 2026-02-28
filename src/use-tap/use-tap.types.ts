export interface TapState {
  startX: number;
  startY: number;
  startTime: number;
  active: boolean;
}

export const TapEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type TapEventPointerType =
  (typeof TapEventPointerTypes)[keyof typeof TapEventPointerTypes];

export interface TapData {
  x: number;
  y: number;
}

export interface TapOptions {
  eventPointerTypes: TapEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  threshold: number;
  maxDuration: number;
  container: { current: EventTarget | null };
}

export type UseTapCallback =
  | ((event: PointerEvent, data: TapData) => boolean)
  | ((event: PointerEvent, data: TapData) => void);

export type UseTapOptions = Partial<TapOptions>;
