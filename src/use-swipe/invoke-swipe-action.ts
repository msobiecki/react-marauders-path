import { SwipeData, SwipeDirection } from "./use-swipe.types";

/**
 * Invokes a swipe action callback with optional event modifications.
 *
 * Handles swipe event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The swipe event
 * @param {SwipeData} data - The normalized swipe data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokeSwipeAction(event, data, (e, d) => {
 *   console.log(`Swipe moved: ${d.x}, ${d.y}, ${d.z}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokeSwipeAction = (
  event: PointerEvent,
  direction: SwipeDirection,
  data: SwipeData,
  callback:
    | ((
        event: PointerEvent,
        direction: SwipeDirection,
        data: SwipeData,
      ) => boolean)
    | ((
        event: PointerEvent,
        direction: SwipeDirection,
        data: SwipeData,
      ) => void),
  options: {
    stopImmediate?: boolean;
    once?: boolean;
    onOnce?: () => void;
  },
) => {
  if (options.stopImmediate) {
    event.stopImmediatePropagation();
  }

  const shouldPrevent = callback(event, direction, data);
  if (shouldPrevent) {
    event.preventDefault();
  }

  if (options.once) {
    options.onOnce?.();
  }
};
