export interface WheelOptions {
  eventPassive: boolean;
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  container: { current: EventTarget | null };
  raf: boolean;
}

export interface WheelData {
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  deltaMode: number;
}

export type UseWheelCallback =
  | ((event: WheelEvent, data: WheelData, ...properties: unknown[]) => void)
  | ((event: WheelEvent, data: WheelData, ...properties: unknown[]) => boolean);

export type UseWheelOptions = Partial<WheelOptions>;
