import { useCallback, useEffect, useRef } from "react";
import {
  DragState,
  DragData,
  UseDragCallback,
  UseDragOptions,
  DragOptions,
  DragEventPointerType,
} from "./use-drag.types";
import { invokeDragAction } from "./invoke-drag-action";

const defaultOptions: DragOptions = {
  eventPointerTypes: ["touch", "mouse", "pen"],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  threshold: 0,
  container: { current: null },
  raf: false,
};

const useDrag = (
  dragCallback: UseDragCallback,
  options: UseDragOptions = {},
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
  const firedOnceReference = useRef(false);

  const frameReference = useRef<number | null>(null);
  const pendingDataReference = useRef<DragData | null>(null);
  const pendingEventReference = useRef<PointerEvent | null>(null);

  const dragStateReference = useRef<DragState>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    active: false,
  });

  const destroyListener = useCallback(() => {
    abortControllerReference.current?.abort();
  }, []);

  const flushFrame = useCallback(() => {
    frameReference.current = null;

    const data = pendingDataReference.current;
    const event = pendingEventReference.current;

    if (!data || !event) return;

    invokeDragAction(event, data, dragCallback, {
      stopImmediate: eventStopImmediatePropagation,
      once: eventOnce,
      onOnce: () => {
        firedOnceReference.current = true;
        destroyListener();
      },
    });

    pendingDataReference.current = null;
    pendingEventReference.current = null;
  }, [dragCallback, eventStopImmediatePropagation, eventOnce, destroyListener]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary) return;

      if (
        !eventPointerTypes.includes(event.pointerType as DragEventPointerType)
      ) {
        return;
      }

      dragStateReference.current = {
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        startTime: Date.now(),
        active: true,
      };
    },
    [eventPointerTypes],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const state = dragStateReference.current;
      if (!state.active) return;
      if (!event.isPrimary) return;

      if (
        !eventPointerTypes.includes(event.pointerType as DragEventPointerType)
      ) {
        return;
      }

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const movementX = event.clientX - state.lastX;
      const movementY = event.clientY - state.lastY;

      const distance = Math.hypot(deltaX, deltaY);

      if (distance < threshold) return;

      const duration = Date.now() - state.startTime;

      const data: DragData = {
        deltaX,
        deltaY,
        movementX,
        movementY,
        duration,
        startX: state.startX,
        startY: state.startY,
        endX: event.clientX,
        endY: event.clientY,
      };

      state.lastX = event.clientX;
      state.lastY = event.clientY;

      if (!raf) {
        invokeDragAction(event, data, dragCallback, {
          stopImmediate: eventStopImmediatePropagation,
          once: eventOnce,
          onOnce: () => {
            firedOnceReference.current = true;
            destroyListener();
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
      eventPointerTypes,
      threshold,
      raf,
      dragCallback,
      eventStopImmediatePropagation,
      eventOnce,
      destroyListener,
      flushFrame,
    ],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary) return;

      if (
        !eventPointerTypes.includes(event.pointerType as DragEventPointerType)
      ) {
        return;
      }

      dragStateReference.current.active = false;
    },
    [eventPointerTypes],
  );

  const handlePointerCancel = useCallback(() => {
    dragStateReference.current.active = false;
  }, []);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const pointerDownListener = (event: Event) =>
      handlePointerDown(event as PointerEvent);

    const pointerMoveListener = (event: Event) =>
      handlePointerMove(event as PointerEvent);

    const pointerUpListener = (event: Event) =>
      handlePointerUp(event as PointerEvent);

    const pointerCancelListener = () => handlePointerCancel();

    targetReference.current.addEventListener(
      "pointerdown",
      pointerDownListener,
      {
        capture: eventCapture,
        signal: abortControllerReference.current.signal,
      },
    );

    targetReference.current.addEventListener(
      "pointermove",
      pointerMoveListener,
      {
        capture: eventCapture,
        signal: abortControllerReference.current.signal,
      },
    );

    targetReference.current.addEventListener("pointerup", pointerUpListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    targetReference.current.addEventListener(
      "pointercancel",
      pointerCancelListener,
      {
        capture: eventCapture,
        signal: abortControllerReference.current.signal,
      },
    );

    return () => {
      abortControllerReference.current?.abort();
      dragStateReference.current.active = false;

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

export default useDrag;
