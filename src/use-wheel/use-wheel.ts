import { useCallback, useEffect, useRef } from "react";
import {
  UseWheelCallback,
  UseWheelOptions,
  WheelData,
  WheelOptions,
} from "./use-wheel.types";
import { shouldHandleWheelEvent } from "./event-guards";
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
  const firedOnceReference = useRef(false);

  const frameReference = useRef<number | null>(null);
  const pendingDataReference = useRef<WheelData | null>(null);
  const pendingEventReference = useRef<WheelEvent | null>(null);

  const destroyListener = useCallback(() => {
    abortControllerReference.current?.abort();
  }, []);

  const shouldProcessEvent = useCallback(() => {
    return shouldHandleWheelEvent({
      once: eventOnce,
      firedOnce: firedOnceReference.current,
    });
  }, [eventOnce]);

  const flushFrame = useCallback(() => {
    frameReference.current = null;

    const data = pendingDataReference.current;
    const event = pendingEventReference.current;

    if (!data || !event) return;

    invokeWheelAction(event, data, wheelCallback, {
      stopImmediate: eventStopImmediatePropagation,
      once: eventOnce,
      onOnce: () => {
        firedOnceReference.current = true;
        destroyListener();
      },
    });

    pendingDataReference.current = null;
    pendingEventReference.current = null;
  }, [
    wheelCallback,
    eventStopImmediatePropagation,
    eventOnce,
    destroyListener,
  ]);

  const handleEventListener = useCallback(
    (event: WheelEvent) => {
      if (!shouldProcessEvent()) {
        return;
      }

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
            firedOnceReference.current = true;
            destroyListener();
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
    [
      raf,
      shouldProcessEvent,
      wheelCallback,
      eventStopImmediatePropagation,
      eventOnce,
      destroyListener,
      flushFrame,
    ],
  );

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const eventListener = (event: Event) =>
      handleEventListener(event as WheelEvent);

    targetReference.current.addEventListener("wheel", eventListener, {
      passive: eventPassive,
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
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
