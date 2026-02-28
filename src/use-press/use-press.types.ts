export const PressEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type PressEventPointerType =
  (typeof PressEventPointerTypes)[keyof typeof PressEventPointerTypes];

export interface PressData {
  x: number;
  y: number;
}

export interface PressOptions {
  eventPointerTypes: PressEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  delay: number;
  threshold: number;
  container: { current: EventTarget | null };
}

export type UsePressCallback =
  | ((event: PointerEvent, data: PressData) => void)
  | ((event: PointerEvent, data: PressData) => boolean);

export type UsePressOptions = Partial<PressOptions>;
