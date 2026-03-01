export const PointerEventTypes = {
  Move: "pointermove",
  Enter: "pointerenter",
  Leave: "pointerleave",
  Up: "pointerup",
  Down: "pointerdown",
  Over: "pointerover",
  Out: "pointerout",
  Cancel: "pointercancel",
} as const;

export type PointerEventType =
  (typeof PointerEventTypes)[keyof typeof PointerEventTypes];

export const PointerEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type PointerEventPointerType =
  (typeof PointerEventPointerTypes)[keyof typeof PointerEventPointerTypes];

export interface PointerOptions {
  eventType: PointerEventType[];
  eventPointerTypes: PointerEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  container: { current: EventTarget | null };
}

export interface PointerData {
  x: number;
  y: number;
}

export type UsePointerCallback =
  | ((
      event: PointerEvent,
      type: PointerEventType,
      data: PointerData,
      ...properties: unknown[]
    ) => void)
  | ((
      event: PointerEvent,
      type: PointerEventType,
      data: PointerData,
      ...properties: unknown[]
    ) => boolean);

export type UsePointerOptions = Partial<PointerOptions>;
