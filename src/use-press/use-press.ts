import { useCallback, useEffect, useRef } from "react";
import {
  PressOptions,
  PressData,
  PressEventPointerTypes,
  UsePressCallback,
  UsePressOptions,
} from "./use-press.types";
import { invokePressAction } from "./invoke-press-action";
import { shouldHandleEvent } from "./event-guards";

const defaultOptions: PressOptions = {
  eventPointerTypes: [
    PressEventPointerTypes.Touch,
    PressEventPointerTypes.Mouse,
    PressEventPointerTypes.Pen,
  ],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  delay: 500,
  threshold: 8,
  container: { current: null },
};

const usePress = (
  pressCallback: UsePressCallback,
  options: UsePressOptions = {},
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

  const pressStateReference = useRef<{
    x: number;
    y: number;
    active: boolean;
  }>({
    x: 0,
    y: 0,
    active: false,
  });

  const timerReference = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPress = useCallback(() => {
    if (timerReference.current !== null) {
      clearTimeout(timerReference.current);
      timerReference.current = null;
    }
    pressStateReference.current.active = false;
  }, []);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      pressStateReference.current = {
        x: event.clientX,
        y: event.clientY,
        active: true,
      };

      timerReference.current = setTimeout(() => {
        const data: PressData = {
          x: event.clientX,
          y: event.clientY,
        };
        invokePressAction(event, data, pressCallback, {
          stopImmediate: eventStopImmediatePropagation,
          once: eventOnce,
          onOnce: () => {
            abortControllerReference.current?.abort();
          },
        });

        clearPress();
      }, delay);
    },
    [
      eventPointerTypes,
      eventOnce,
      eventStopImmediatePropagation,
      delay,
      pressCallback,
      clearPress,
    ],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      const state = pressStateReference.current;
      if (!state.active) {
        return;
      }

      const deltaX = event.clientX - state.x;
      const deltaY = event.clientY - state.y;

      if (Math.hypot(deltaX, deltaY) > threshold) {
        clearPress();
      }
    },
    [eventPointerTypes, threshold, clearPress],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      clearPress();
    },

    [eventPointerTypes, clearPress],
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      clearPress();
    },
    [eventPointerTypes, clearPress],
  );

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();
    const { signal } = abortControllerReference.current;

    const pointerDownListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerDown(event);

    const pointerMoveListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerMove(event);

    const pointerUpListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerUp(event);

    const pointerCancelListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerCancel(event);

    targetReference.current.addEventListener(
      "pointerdown",
      pointerDownListener,
      { capture: eventCapture, signal },
    );

    targetReference.current.addEventListener(
      "pointermove",
      pointerMoveListener,
      { capture: eventCapture, signal },
    );

    targetReference.current.addEventListener("pointerup", pointerUpListener, {
      capture: eventCapture,
      signal,
    });

    targetReference.current.addEventListener(
      "pointercancel",
      pointerCancelListener,
      { capture: eventCapture, signal },
    );

    return () => {
      abortControllerReference.current?.abort();
      clearPress();
    };
  }, [
    container,
    eventCapture,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    clearPress,
  ]);
};

export default usePress;
