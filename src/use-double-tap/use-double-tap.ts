import { useCallback, useEffect, useRef } from "react";
import {
  DoubleTapData,
  DoubleTapOptions,
  DoubleTapEventPointerTypes,
  UseDoubleTapCallback,
  UseDoubleTapOptions,
} from "./use-double-tap.types";
import { invokeDoubleTapAction } from "./invoke-double-tap-action";
import { shouldHandleEvent } from "./event-guards";

const defaultOptions: DoubleTapOptions = {
  eventPointerTypes: [
    DoubleTapEventPointerTypes.Touch,
    DoubleTapEventPointerTypes.Mouse,
    DoubleTapEventPointerTypes.Pen,
  ],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  delay: 300,
  threshold: 8,
  container: { current: null },
};

const useDoubleTap = (
  doubleTapCallback: UseDoubleTapCallback,
  options: UseDoubleTapOptions = {},
) => {
  const {
    eventPointerTypes,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    delay,
    threshold,
    container,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  const lastTapReference = useRef<{
    time: number;
    x: number;
    y: number;
  } | null>(null);

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      const now = Date.now();

      if (!lastTapReference.current) {
        lastTapReference.current = {
          time: now,
          x: event.clientX,
          y: event.clientY,
        };
        return;
      }

      const deltaTime = now - lastTapReference.current.time;
      const deltaX = event.clientX - lastTapReference.current.x;
      const deltaY = event.clientY - lastTapReference.current.y;

      if (deltaTime <= delay && Math.hypot(deltaX, deltaY) <= threshold) {
        const data: DoubleTapData = {
          x: event.clientX,
          y: event.clientY,
        };

        invokeDoubleTapAction(event, data, doubleTapCallback, {
          stopImmediate: eventStopImmediatePropagation,
          once: eventOnce,
          onOnce: () => abortControllerReference.current?.abort(),
        });

        lastTapReference.current = null;
        return;
      }

      lastTapReference.current = {
        time: now,
        x: event.clientX,
        y: event.clientY,
      };
    },
    [
      eventPointerTypes,
      eventOnce,
      eventStopImmediatePropagation,
      delay,
      threshold,
      doubleTapCallback,
    ],
  );

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();
    const { signal } = abortControllerReference.current;

    const pointerUpListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerUp(event);

    targetReference.current.addEventListener("pointerup", pointerUpListener, {
      capture: eventCapture,
      signal,
    });

    return () => {
      abortControllerReference.current?.abort();
      lastTapReference.current = null;
    };
  }, [container, eventCapture, handlePointerUp]);
};

export default useDoubleTap;
