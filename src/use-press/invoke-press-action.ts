import { PressData } from "./use-press.types";

/**
 * Invokes a press action callback with optional event modifications.
 *
 * Handles press event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The press event
 * @param {PressData} data - The normalized press data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokePressAction(event, data, (e, d) => {
 *   console.log(`Press at: ${d.x}, ${d.y}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokePressAction = (
  event: PointerEvent,
  data: PressData,
  callback:
    | ((event: PointerEvent, data: PressData) => boolean)
    | ((event: PointerEvent, data: PressData) => void),
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
