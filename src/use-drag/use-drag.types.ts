export interface DragState {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startTime: number;
  active: boolean;
}

export const DragEventPointerTypes = {
  Touch: "touch",
  Mouse: "mouse",
  Pen: "pen",
} as const;

export type DragEventPointerType =
  (typeof DragEventPointerTypes)[keyof typeof DragEventPointerTypes];

export interface DragData {
  deltaX: number;
  deltaY: number;
  movementX: number;
  movementY: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface DragOptions {
  eventPointerTypes: DragEventPointerType[];
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  threshold: number;
  container: { current: HTMLElement | null };
  raf: boolean;
}

export type UseDragCallback =
  | ((event: PointerEvent, data: DragData) => boolean)
  | ((event: PointerEvent, data: DragData) => void);

export type UseDragOptions = Partial<DragOptions>;
