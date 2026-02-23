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
} from "./use-swipe.types";
import { parseSwipeDirection } from "./parse-swipe-direction";

const defaultOptions: SwipeOptions = {
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
    threshold,
    velocity,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    container,
  } = { ...defaultOptions, ...options };

  const allowedDirectionsReference = useRef<SwipeDirection[]>([]);
  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);
  const firedOnceReference = useRef(false);

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

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    swipeStateReference.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      active: true,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      const state = swipeStateReference.current;
      if (!state.active) {
        return;
      }
      const touch = event.changedTouches[0];
      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const duration = Date.now() - state.startTime;

      const distance = Math.hypot(deltaX, deltaY);
      const computedVelocity = distance / duration;

      state.active = false;

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

      if (eventStopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      const data: SwipeData = {
        direction,
        deltaX,
        deltaY,
        velocity: computedVelocity,
        duration,
      };

      swipeCallback(event, data);

      if (eventOnce && !firedOnceReference.current) {
        firedOnceReference.current = true;
        destroyListener();
      }
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

  useEffect(() => {
    allowedDirectionsReference.current = parseSwipeDirection(swipe);
  }, [swipe]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const touchStartListener = (event: Event) =>
      handleTouchStart(event as TouchEvent);

    targetReference.current.addEventListener("touchstart", touchStartListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    const touchEndListener = (event: Event) =>
      handleTouchEnd(event as TouchEvent);

    targetReference.current.addEventListener("touchend", touchEndListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    return () => {
      abortControllerReference.current?.abort();
      swipeStateReference.current.active = false;
    };
  }, [eventCapture, container, handleTouchStart, handleTouchEnd]);
};

export default useSwipe;
