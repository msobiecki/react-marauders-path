export interface PinchState {
  pointers: Map<number, PointerEvent>;
  startDistance: number;
  lastDistance: number;
  active: boolean;
}

export const PinchEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type PinchEventPointerType =
  (typeof PinchEventPointerTypes)[keyof typeof PinchEventPointerTypes];

export interface PinchOptions {
  eventPointerTypes: PinchEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  threshold: number;
  container: { current: HTMLElement | null };
  raf: boolean;
}

export interface PinchData {
  distance: number;
  delta: number;
  totalDelta: number;
  scale: number;
}

export type UsePinchCallback =
  | ((event: PointerEvent, data: PinchData) => boolean)
  | ((event: PointerEvent, data: PinchData) => void);

export type UsePinchOptions = Partial<PinchOptions>;
