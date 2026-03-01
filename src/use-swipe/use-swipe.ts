import { useCallback, useEffect, useRef } from "react";
import {
  SwipeDirection,
  SwipeState,
  SwipeDirections,
  SwipeData,
  SwipeOptions,
  SwipeEventPointerTypes,
  UseSwipeSchema,
  UseSwipeOptions,
  UseSwipeCallback,
} from "./use-swipe.types";
import { parseSwipeDirection } from "./parse-swipe-direction";
import { invokeSwipeAction } from "./invoke-swipe-action";
import { shouldHandleEvent } from "./event-guards";

const defaultOptions: SwipeOptions = {
  eventPointerTypes: [
    SwipeEventPointerTypes.Touch,
    SwipeEventPointerTypes.Mouse,
    SwipeEventPointerTypes.Pen,
  ],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  threshold: 50,
  velocity: 0.3,
  container: { current: null },
};

const useSwipe = (
  swipe: UseSwipeSchema,
  swipeCallback: UseSwipeCallback,
  options: UseSwipeOptions = {},
) => {
  const {
    eventPointerTypes,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    threshold,
    velocity,
    container,
  } = { ...defaultOptions, ...options };

  const allowedDirectionsReference = useRef<SwipeDirection[]>([]);
  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);

  const swipeStateReference = useRef<SwipeState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    active: false,
  });

  const resolveDirection = useCallback(
    (deltaX: number, deltaY: number): SwipeDirection => {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        return deltaX > 0 ? SwipeDirections.Right : SwipeDirections.Left;
      }

      return deltaY > 0 ? SwipeDirections.Down : SwipeDirections.Up;
    },
    [],
  );

  const matchesSchema = useCallback((direction: SwipeDirection): boolean => {
    const allowed = allowedDirectionsReference.current;

    if (allowed.includes(SwipeDirections.Both)) {
      return true;
    }

    if (
      allowed.includes(SwipeDirections.Horizontal) &&
      (direction === SwipeDirections.Left ||
        direction === SwipeDirections.Right)
    ) {
      return true;
    }

    if (
      allowed.includes(SwipeDirections.Vertical) &&
      (direction === SwipeDirections.Up || direction === SwipeDirections.Down)
    ) {
      return true;
    }

    return allowed.includes(direction);
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

      swipeStateReference.current = {
        startX: event.clientX,
        startY: event.clientY,
        startTime: Date.now(),
        active: true,
      };
    },
    [eventPointerTypes],
  );

  const endSwipe = useCallback(
    (event: PointerEvent) => {
      if (
        !shouldHandleEvent(event, {
          eventPointerTypes,
        })
      ) {
        return;
      }

      const state = swipeStateReference.current;
      if (!state.active) {
        return;
      }

      state.active = false;

      const duration = Date.now() - state.startTime;

      if (duration === 0) {
        return;
      }

      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;

      const distance = Math.hypot(deltaX, deltaY);

      const computedVelocity = distance / duration;

      if (distance < threshold) {
        return;
      }
      if (computedVelocity < velocity) {
        return;
      }

      const direction = resolveDirection(deltaX, deltaY);
      if (!matchesSchema(direction)) {
        return;
      }

      const data: SwipeData = {
        deltaX,
        deltaY,
        velocity: computedVelocity,
        duration,
      };

      invokeSwipeAction(event, direction, data, swipeCallback, {
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
      threshold,
      velocity,
      resolveDirection,
      matchesSchema,
      swipeCallback,
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

      endSwipe(event);
    },
    [eventPointerTypes, endSwipe],
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

      swipeStateReference.current.active = false;
    },
    [eventPointerTypes],
  );

  useEffect(() => {
    allowedDirectionsReference.current = parseSwipeDirection(swipe);
  }, [swipe]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();
    const { signal } = abortControllerReference.current;

    const pointerDownListener = (event: Event) =>
      event instanceof PointerEvent && handlePointerDown(event);

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

      swipeStateReference.current.active = false;
    };
  }, [
    container,
    eventCapture,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
  ]);
};

export default useSwipe;
