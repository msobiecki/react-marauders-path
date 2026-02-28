import { useCallback, useEffect, useRef } from "react";
import {
  UseWheelCallback,
  UseWheelOptions,
  WheelData,
  WheelOptions,
} from "./use-wheel.types";
import { invokeWheelAction } from "./invoke-wheel-action";

const defaultOptions: WheelOptions = {
  eventPassive: true,
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  container: { current: null },
  raf: false,
};

const useWheel = (
  wheelCallback: UseWheelCallback,
  options: UseWheelOptions = defaultOptions,
) => {
  const {
    eventPassive,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    container,
    raf,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  const frameReference = useRef<number | null>(null);
  const pendingDataReference = useRef<WheelData | null>(null);
  const pendingEventReference = useRef<WheelEvent | null>(null);

  const flushFrame = useCallback(() => {
    frameReference.current = null;

    const data = pendingDataReference.current;
    const event = pendingEventReference.current;

    if (!data || !event) {
      return;
    }

    invokeWheelAction(event, data, wheelCallback, {
      stopImmediate: eventStopImmediatePropagation,
      once: eventOnce,
      onOnce: () => {
        abortControllerReference.current?.abort();
      },
    });

    pendingDataReference.current = null;
    pendingEventReference.current = null;
  }, [wheelCallback, eventStopImmediatePropagation, eventOnce]);

  const handleEventListener = useCallback(
    (event: WheelEvent) => {
      const delta: WheelData = {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        deltaMode: event.deltaMode,
      };

      if (!raf) {
        invokeWheelAction(event, delta, wheelCallback, {
          stopImmediate: eventStopImmediatePropagation,
          once: eventOnce,
          onOnce: () => {
            abortControllerReference.current?.abort();
          },
        });
        return;
      }

      pendingDataReference.current = delta;
      pendingEventReference.current = event;

      if (frameReference.current === null) {
        frameReference.current = requestAnimationFrame(flushFrame);
      }
    },
    [raf, wheelCallback, eventStopImmediatePropagation, eventOnce, flushFrame],
  );

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();
    const { signal } = abortControllerReference.current;

    const eventListener = (event: Event) =>
      handleEventListener(event as WheelEvent);

    targetReference.current.addEventListener("wheel", eventListener, {
      passive: eventPassive,
      capture: eventCapture,
      signal,
    });

    return () => {
      abortControllerReference.current?.abort();

      if (frameReference.current !== null) {
        cancelAnimationFrame(frameReference.current);
      }
    };
  }, [container, eventPassive, eventCapture, handleEventListener]);
};

export default useWheel;
