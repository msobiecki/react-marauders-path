import { useCallback, useEffect, useRef } from "react";
import {
  SwipeDirection,
  SwipeState,
  SwipeData,
  UseSwipeSchema,
  UseSwipeOptions,
  UseSwipeCallback,
  SwipeOptions,
  SwipeDirections,
  SwipeEventPointerType,
} from "./use-swipe.types";
import { parseSwipeDirection } from "./parse-swipe-direction";
import { invokeSwipeAction } from "./invoke-swipe-action";

const defaultOptions: SwipeOptions = {
  eventPointerTypes: ["touch", "mouse", "pen"],
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

  const destroyListener = useCallback(() => {
    abortControllerReference.current?.abort();
  }, []);

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
      if (!event.isPrimary) {
        return;
      }

      if (
        !eventPointerTypes.includes(event.pointerType as SwipeEventPointerType)
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
          destroyListener();
        },
      });
    },
    [
      threshold,
      velocity,
      resolveDirection,
      matchesSchema,
      swipeCallback,
      eventOnce,
      eventStopImmediatePropagation,
      destroyListener,
    ],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      if (!event.isPrimary) {
        return;
      }
      if (
        !eventPointerTypes.includes(event.pointerType as SwipeEventPointerType)
      ) {
        return;
      }
      endSwipe(event);
    },
    [endSwipe, eventPointerTypes],
  );

  const handlePointerCancel = useCallback(() => {
    swipeStateReference.current.active = false;
  }, []);

  useEffect(() => {
    allowedDirectionsReference.current = parseSwipeDirection(swipe);
  }, [swipe]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const pointerDownListener = (event: Event) =>
      handlePointerDown(event as PointerEvent);

    targetReference.current.addEventListener(
      "pointerdown",
      pointerDownListener,
      {
        capture: eventCapture,
        signal: abortControllerReference.current.signal,
      },
    );

    const pointerUpListener = (event: Event) =>
      handlePointerUp(event as PointerEvent);

    targetReference.current.addEventListener("pointerup", pointerUpListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    const pointerCancelListener = () => handlePointerCancel();

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
