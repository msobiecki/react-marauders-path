import { useCallback, useEffect, useRef } from "react";
import {
  TapOptions,
  UseTapCallback,
  UseTapOptions,
  TapEventPointerType,
  TapState,
  TapData,
} from "./use-tap.types";
import { invokeTapAction } from "./invoke-tap-action";

const defaultOptions: TapOptions = {
  eventPointerTypes: ["touch", "mouse", "pen"],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  threshold: 8,
  maxDuration: 250,
  container: { current: null },
};

const useTap = (tapCallback: UseTapCallback, options: UseTapOptions = {}) => {
  const {
    eventPointerTypes,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    threshold,
    maxDuration,
    container,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  const tapStateReference = useRef<TapState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    active: false,
  });

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary) {
        return;
      }

      if (
        !eventPointerTypes.includes(event.pointerType as TapEventPointerType)
      ) {
        return;
      }

      tapStateReference.current = {
        startX: event.clientX,
        startY: event.clientY,
        startTime: Date.now(),
        active: true,
      };
    },
    [eventPointerTypes],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      const state = tapStateReference.current;
      if (!state.active) {
        return;
      }
      if (!event.isPrimary) {
        return;
      }

      state.active = false;

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const distance = Math.hypot(deltaX, deltaY);
      const duration = Date.now() - state.startTime;

      if (distance > threshold) {
        return;
      }
      if (duration > maxDuration) {
        return;
      }

      const data: TapData = {
        x: event.clientX,
        y: event.clientY,
      };

      invokeTapAction(event, data, tapCallback, {
        stopImmediate: eventStopImmediatePropagation,
        once: eventOnce,
        onOnce: () => {
          abortControllerReference.current?.abort();
        },
      });
    },
    [
      tapCallback,
      threshold,
      maxDuration,
      eventOnce,
      eventStopImmediatePropagation,
    ],
  );

  const handlePointerCancel = useCallback(() => {
    tapStateReference.current.active = false;
  }, []);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();
    const { signal } = abortControllerReference.current;

    const pointerDownListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerDown(event);

    const pointerUpListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerUp(event);

    const pointerCancelListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerCancel();

    targetReference.current.addEventListener(
      "pointerdown",
      pointerDownListener,
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

      tapStateReference.current.active = false;
    };
  }, [
    container,
    eventCapture,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
  ]);
};

export default useTap;
