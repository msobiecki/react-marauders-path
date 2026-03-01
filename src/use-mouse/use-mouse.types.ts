export const MouseEventTypes = {
  Click: "click",
  ContextMenu: "contextmenu",
  DoubleClick: "dblclick",
  Down: "mousedown",
  Enter: "mouseenter",
  Leave: "mouseleave",
  Move: "mousemove",
  Out: "mouseout",
  Over: "mouseover",
  Up: "mouseup",
} as const;

export type MouseEventType =
  (typeof MouseEventTypes)[keyof typeof MouseEventTypes];

export const MouseButtons = {
  Left: 0,
  Middle: 1,
  Right: 2,
  Fourth: 3,
  Fifth: 4,
} as const;

export type MouseButton = (typeof MouseButtons)[keyof typeof MouseButtons];

export interface MouseOptions {
  eventType: MouseEventType[];
  eventButtons: MouseButton[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  container: { current: EventTarget | null };
}

export interface MouseData {
  x: number;
  y: number;
}

export type UseMouseCallback =
  | ((
      event: MouseEvent,
      type: MouseEventType,
      button: MouseButton,
      data: MouseData,
      ...properties: unknown[]
    ) => void)
  | ((
      event: MouseEvent,
      type: MouseEventType,
      button: MouseButton,
      data: MouseData,
      ...properties: unknown[]
    ) => boolean);

export type UseMouseOptions = Partial<MouseOptions>;
