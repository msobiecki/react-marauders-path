import { useCallback, useEffect, useRef } from "react";
import {
  PointerData,
  PointerEventType,
  PointerEventPointerTypes,
  PointerEventTypes,
  PointerOptions,
  UsePointerCallback,
  UsePointerOptions,
} from "./use-pointer.types";
import { invokePointerAction } from "./invoke-pointer-action";
import { shouldHandleEvent } from "./event-guards";

const defaultOptions: PointerOptions = {
  eventType: [
    PointerEventTypes.Move,
    PointerEventTypes.Down,
    PointerEventTypes.Up,
  ],
  eventPointerTypes: [
    PointerEventPointerTypes.Touch,
    PointerEventPointerTypes.Mouse,
    PointerEventPointerTypes.Pen,
  ],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  container: { current: null },
};

const usePointer = (
  pointerCallback: UsePointerCallback,
  options: UsePointerOptions = {},
) => {
  const {
    eventType,
    eventPointerTypes,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    container,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  const handlePointer = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      const data: PointerData = {
        x: event.clientX,
        y: event.clientY,
      };

      const type = event.type as PointerEventType;

      invokePointerAction(event, type, data, pointerCallback, {
        stopImmediate: eventStopImmediatePropagation,
        once: eventOnce,
        onOnce: () => {
          abortControllerReference.current?.abort();
        },
      });
    },
    [
      eventPointerTypes,
      eventOnce,
      eventStopImmediatePropagation,
      pointerCallback,
    ],
  );

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();
    const { signal } = abortControllerReference.current;

    const pointerListener = (event: Event) =>
      event instanceof PointerEvent && handlePointer(event);

    eventType?.forEach((type) => {
      targetReference.current?.addEventListener(type, pointerListener, {
        capture: eventCapture,
        signal,
      });
    });

    return () => {
      abortControllerReference.current?.abort();
    };
  }, [container, eventCapture, eventType, handlePointer]);
};

export default usePointer;
