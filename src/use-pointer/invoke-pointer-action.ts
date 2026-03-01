import { PointerData, PointerEventType } from "./use-pointer.types";

/**
 * Invokes a pointer action callback with optional event modifications.
 *
 * Handles pointer event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The pointer event
 * @param {PointerEventType} type - The type of the pointer event
 * @param {PointerData} data - The normalized pointer data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokePointerAction(event, type, data, (e, d) => {
 *   console.log(`Pointer at: ${d.x}, ${d.y}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokePointerAction = (
  event: PointerEvent,
  type: PointerEventType,
  data: PointerData,
  callback:
    | ((
        event: PointerEvent,
        type: PointerEventType,
        data: PointerData,
      ) => boolean)
    | ((
        event: PointerEvent,
        type: PointerEventType,
        data: PointerData,
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

  const shouldPrevent = callback(event, type, data);
  if (shouldPrevent) {
    event.preventDefault();
  }

  if (options.once) {
    options.onOnce?.();
  }
};
