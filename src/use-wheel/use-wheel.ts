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

const eventType = "wheel";

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
  const lastEventReference = useRef<WheelEvent | null>(null);

  const destroyListener = useCallback(() => {
    if (abortControllerReference.current) {
      abortControllerReference.current.abort();
    }
  }, []);

  const shouldProcessEvent = useCallback(() => {
    return shouldHandleWheelEvent({
      once: eventOnce,
      firedOnce: firedOnceReference.current,
    });
  }, [eventOnce]);

  const handleEventListener = useCallback(
    (event: WheelEvent) => {
      if (!shouldProcessEvent()) {
        return;
      }

      const delta: WheelData = {
        x: event.deltaX,
        y: event.deltaY,
        z: event.deltaZ,
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

      lastEventReference.current = event;
      if (frameReference.current === null) {
        frameReference.current = requestAnimationFrame(() => {
          if (lastEventReference.current) {
            invokeWheelAction(
              lastEventReference.current,
              delta,
              wheelCallback,
              {
                stopImmediate: eventStopImmediatePropagation,
                once: eventOnce,
                onOnce: () => {
                  firedOnceReference.current = true;
                  destroyListener();
                },
              },
            );
          }
          frameReference.current = null;
        });
      }
    },
    [
      eventOnce,
      eventStopImmediatePropagation,
      raf,
      shouldProcessEvent,
      wheelCallback,
      destroyListener,
    ],
  );

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const eventListener = (event: Event) => {
      handleEventListener(event as WheelEvent);
    };

    targetReference.current.addEventListener(eventType, eventListener, {
      passive: eventPassive,
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    return () => {
      abortControllerReference.current?.abort();
    };
  }, [eventPassive, eventCapture, container, handleEventListener]);
};

export default useWheel;
