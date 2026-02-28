import { useCallback, useEffect, useRef } from "react";
import {
  PinchState,
  PinchData,
  UsePinchCallback,
  UsePinchOptions,
  PinchOptions,
  PinchEventPointerType,
} from "./use-pinch.types";
import { invokePinchAction } from "./invoke-pinch-action";

const defaultOptions: PinchOptions = {
  eventPointerTypes: ["touch"],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  threshold: 0,
  container: { current: null },
  raf: false,
};

const usePinch = (
  pinchCallback: UsePinchCallback,
  options: UsePinchOptions = {},
) => {
  const {
    eventPointerTypes,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    threshold,
    container,
    raf,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  const frameReference = useRef<number | null>(null);
  const pendingDataReference = useRef<PinchData | null>(null);
  const pendingEventReference = useRef<PointerEvent | null>(null);

  const pinchStateReference = useRef<PinchState>({
    pointers: new Map(),
    startDistance: 0,
    lastDistance: 0,
    active: false,
  });

  const flushFrame = useCallback(() => {
    frameReference.current = null;

    const data = pendingDataReference.current;
    const event = pendingEventReference.current;

    if (!data || !event) {
      return;
    }

    invokePinchAction(event, data, pinchCallback, {
      stopImmediate: eventStopImmediatePropagation,
      once: eventOnce,
      onOnce: () => {
        abortControllerReference.current?.abort();
      },
    });

    pendingDataReference.current = null;
    pendingEventReference.current = null;
  }, [pinchCallback, eventStopImmediatePropagation, eventOnce]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (
        !eventPointerTypes.includes(event.pointerType as PinchEventPointerType)
      ) {
        return;
      }

      const state = pinchStateReference.current;

      state.pointers.set(event.pointerId, event);

      if (state.pointers.size === 2) {
        const [pointer1, pointer2] = [...state.pointers.values()];

        const deltaX = pointer2.clientX - pointer1.clientX;
        const deltaY = pointer2.clientY - pointer1.clientY;

        const distance = Math.hypot(deltaX, deltaY);

        state.startDistance = distance;
        state.lastDistance = distance;
        state.active = true;
      }
    },
    [eventPointerTypes],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const state = pinchStateReference.current;
      if (!state.active) {
        return;
      }

      if (!state.pointers.has(event.pointerId)) {
        return;
      }

      state.pointers.set(event.pointerId, event);

      if (state.pointers.size < 2) {
        return;
      }

      const [pointer1, pointer2] = [...state.pointers.values()];

      const deltaX = pointer2.clientX - pointer1.clientX;
      const deltaY = pointer2.clientY - pointer1.clientY;

      const distance = Math.hypot(deltaX, deltaY);

      const delta = distance - state.lastDistance;
      const totalDelta = distance - state.startDistance;

      if (Math.abs(totalDelta) < threshold) {
        return;
      }

      const scale = distance / state.startDistance;

      const data: PinchData = {
        distance,
        delta,
        totalDelta,
        scale,
      };

      state.lastDistance = distance;

      if (!raf) {
        invokePinchAction(event, data, pinchCallback, {
          stopImmediate: eventStopImmediatePropagation,
          once: eventOnce,
          onOnce: () => {
            abortControllerReference.current?.abort();
          },
        });
        return;
      }

      pendingDataReference.current = data;
      pendingEventReference.current = event;

      if (frameReference.current === null) {
        frameReference.current = requestAnimationFrame(flushFrame);
      }
    },
    [
      threshold,
      raf,
      pinchCallback,
      eventStopImmediatePropagation,
      eventOnce,
      flushFrame,
    ],
  );

  const handlePointerUp = useCallback((event: PointerEvent) => {
    const state = pinchStateReference.current;

    state.pointers.delete(event.pointerId);

    if (state.pointers.size < 2) {
      state.active = false;
      state.startDistance = 0;
      state.lastDistance = 0;
    }
  }, []);

  const handlePointerCancel = useCallback((event: PointerEvent) => {
    const state = pinchStateReference.current;

    state.pointers.delete(event.pointerId);
    state.active = false;
  }, []);

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
      {
        capture: eventCapture,
        signal,
      },
    );

    targetReference.current.addEventListener(
      "pointermove",
      pointerMoveListener,
      {
        capture: eventCapture,
        signal,
      },
    );

    targetReference.current.addEventListener("pointerup", pointerUpListener, {
      capture: eventCapture,
      signal,
    });

    targetReference.current.addEventListener(
      "pointercancel",
      pointerCancelListener,
      {
        capture: eventCapture,
        signal,
      },
    );

    return () => {
      abortControllerReference.current?.abort();

      pinchStateReference.current.active = false;
      pinchStateReference.current.pointers.clear();

      if (frameReference.current !== null) {
        cancelAnimationFrame(frameReference.current);
      }
    };
  }, [
    container,
    eventCapture,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  ]);
};

export default usePinch;
