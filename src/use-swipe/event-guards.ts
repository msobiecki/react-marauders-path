import { SwipeEventPointerType } from "./use-swipe.types";

/**
 * Determines whether a pointer event should be handled based on event options.
 *
 * @param {PointerEvent} event - The pointer event to evaluate
 * @param {Object} options - Event handling options
 * @param {SwipeEventPointerType[]} options.eventPointerTypes - Allowed pointer types for the event
 * @returns {boolean} True if the event should be handled, false otherwise
 *
 * @example
 * const shouldHandle = shouldHandleEvent(event, {
 *   eventPointerTypes: [SwipeEventPointerTypes.Touch]
 * });
 */
export const shouldHandleEvent = (
  event: PointerEvent,
  options: {
    eventPointerTypes: SwipeEventPointerType[];
  },
) => {
  if (!event.isPrimary) {
    return false;
  }
  if (
    !options.eventPointerTypes.includes(
      event.pointerType as SwipeEventPointerType,
    )
  ) {
    return false;
  }

  return true;
};
