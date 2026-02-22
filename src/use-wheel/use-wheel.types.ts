export interface WheelOptions {
  eventPassive: boolean;
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  container: { current: HTMLElement | null };
  raf: boolean;
}

export interface WheelData {
  x: number;
  y: number;
  z: number;
  deltaMode: number;
}

export type UseWheelCallback =
  | ((event: WheelEvent, delta: WheelData, ...properties: unknown[]) => void)
  | ((
      event: WheelEvent,
      delta: WheelData,
      ...properties: unknown[]
    ) => boolean);

export type UseWheelOptions = Partial<WheelOptions>;
