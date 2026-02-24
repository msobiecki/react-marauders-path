import { WheelData } from "./use-wheel.types";

/**
 * Invokes a wheel action callback with optional event modifications.
 *
 * Handles wheel event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {WheelEvent} event - The wheel event
 * @param {WheelData} delta - The normalized wheel delta
 * @param {Function} callback - Function to invoke with (event, delta). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokeWheelAction(event, delta, (e, d) => {
 *   console.log(`Wheel moved: ${d.x}, ${d.y}, ${d.z}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokeWheelAction = (
  event: WheelEvent,
  data: WheelData,
  callback:
    | ((event: WheelEvent, data: WheelData) => boolean)
    | ((event: WheelEvent, data: WheelData) => void),
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
