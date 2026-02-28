import { useCallback, useEffect, useRef } from "react";
import {
  DoubleTapOptions,
  UseDoubleTapCallback,
  UseDoubleTapOptions,
  DoubleTapEventPointerType,
  DoubleTapData,
} from "./use-double-tap.types";
import { invokeDoubleTapAction } from "./invoke-double-tap-action";

const defaultOptions: DoubleTapOptions = {
  eventPointerTypes: ["touch", "mouse", "pen"],
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
      if (!event.isPrimary) {
        return;
      }
      if (
        !eventPointerTypes.includes(
          event.pointerType as DoubleTapEventPointerType,
        )
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
      doubleTapCallback,
      delay,
      threshold,
      eventPointerTypes,
      eventOnce,
      eventStopImmediatePropagation,
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
