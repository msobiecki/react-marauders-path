import { PinchData } from "./use-pinch.types";

/**
 * Invokes a pinch action callback with optional event modifications.
 *
 * Handles pinch event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The pinch event
 * @param {PinchData} data - The normalized pinch data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokePinchAction(event, data, (e, d) => {
 *   console.log(`Pinch moved: ${d.distance}, ${d.delta}, ${d.scale}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokePinchAction = (
  event: PointerEvent,
  data: PinchData,
  callback:
    | ((event: PointerEvent, data: PinchData) => boolean)
    | ((event: PointerEvent, data: PinchData) => void),
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
