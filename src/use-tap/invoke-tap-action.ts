import { TapData } from "./use-tap.types";

/**
 * Invokes a tap action callback with optional event modifications.
 *
 * Handles tap event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The tap event
 * @param {TapData} data - The normalized tap data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokeTapAction(event, data, (e, d) => {
 *   console.log(`Tap at: ${d.x}, ${d.y}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokeTapAction = (
  event: PointerEvent,
  data: TapData,
  callback:
    | ((event: PointerEvent, data: TapData) => boolean)
    | ((event: PointerEvent, data: TapData) => void),
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
