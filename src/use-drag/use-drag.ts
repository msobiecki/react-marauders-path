import { useCallback, useEffect, useRef } from "react";
import {
  DragState,
  DragData,
  DragOptions,
  DragEventPointerTypes,
  UseDragCallback,
  UseDragOptions,
} from "./use-drag.types";
import { invokeDragAction } from "./invoke-drag-action";
import { shouldHandleEvent } from "./event-guards";

const defaultOptions: DragOptions = {
  eventPointerTypes: [
    DragEventPointerTypes.Touch,
    DragEventPointerTypes.Mouse,
    DragEventPointerTypes.Pen,
  ],
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

  const flushFrame = useCallback(() => {
    frameReference.current = null;

    const data = pendingDataReference.current;
    const event = pendingEventReference.current;

    if (!data || !event) {
      return;
    }

    invokeDragAction(event, data, dragCallback, {
      stopImmediate: eventStopImmediatePropagation,
      once: eventOnce,
      onOnce: () => {
        abortControllerReference.current?.abort();
      },
    });

    pendingDataReference.current = null;
    pendingEventReference.current = null;
  }, [dragCallback, eventStopImmediatePropagation, eventOnce]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
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
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      const state = dragStateReference.current;
      if (!state.active) {
        return;
      }

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const movementX = event.clientX - state.lastX;
      const movementY = event.clientY - state.lastY;

      const distance = Math.hypot(deltaX, deltaY);

      if (distance < threshold) {
        return;
      }

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
      eventPointerTypes,
      eventStopImmediatePropagation,
      eventOnce,
      threshold,
      raf,
      dragCallback,
      flushFrame,
    ],
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

      dragStateReference.current.active = false;
    },
    [eventPointerTypes],
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

      dragStateReference.current.active = false;
    },
    [eventPointerTypes],
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
