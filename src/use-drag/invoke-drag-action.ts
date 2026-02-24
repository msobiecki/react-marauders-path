import { DragData } from "./use-drag.types";

/**
 * Invokes a drag action callback with optional event modifications.
 *
 * Handles drag event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {PointerEvent} event - The drag event
 * @param {DragData} data - The normalized drag data
 * @param {Function} callback - Function to invoke with (event, data). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokeDragAction(event, data, (e, d) => {
 *   console.log(`Drag moved: ${d.x}, ${d.y}, ${d.z}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokeDragAction = (
  event: PointerEvent,
  data: DragData,
  callback:
    | ((event: PointerEvent, data: DragData) => boolean)
    | ((event: PointerEvent, data: DragData) => void),
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
