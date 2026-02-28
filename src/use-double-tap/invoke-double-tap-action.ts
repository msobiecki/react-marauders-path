import { DoubleTapData } from "./use-double-tap.types";

/**
 * Invokes a double tap action callback with optional event modifications.
 *
 * Handles double tap event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The double tap event
 * @param {DoubleTapData} data - The normalized double tap data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokeTapAction(event, data, (e, d) => {
 *   console.log(`Double tap at: ${d.x}, ${d.y}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokeDoubleTapAction = (
  event: PointerEvent,
  data: DoubleTapData,
  callback:
    | ((event: PointerEvent, data: DoubleTapData) => boolean)
    | ((event: PointerEvent, data: DoubleTapData) => void),
  options: {
    stopImmediate?: boolean;
    once?: boolean;
    onOnce?: () => void;
  },
) => {
  if (options.stopImmediate) {
    event.stopImmediatePropagation();
  }

  const shouldPrevent = callback(event, data);
  if (shouldPrevent) {
    event.preventDefault();
  }

  if (options.once) {
    options.onOnce?.();
  }
};
