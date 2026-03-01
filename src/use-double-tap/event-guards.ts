import { DoubleTapEventPointerType } from "./use-double-tap.types";

/**
 * Determines whether a pointer event should be handled based on event options.
 *
 * @param {PointerEvent} event - The pointer event to evaluate
 * @param {Object} options - Event handling options
 * @param {DoubleTapEventPointerType[]} options.eventPointerTypes - Allowed pointer types for the event
 * @returns {boolean} True if the event should be handled, false otherwise
 *
 * @example
 * const shouldHandle = shouldHandleEvent(event, {
 *   eventPointerTypes: [DoubleTapEventPointerTypes.Touch]
 * });
 */
export const shouldHandleEvent = (
  event: PointerEvent,
  options: {
    eventPointerTypes: DoubleTapEventPointerType[];
  },
) => {
  if (!event.isPrimary) {
    return false;
  }
  if (
    !options.eventPointerTypes.includes(
      event.pointerType as DoubleTapEventPointerType,
    )
  ) {
    return false;
  }

  return true;
};
