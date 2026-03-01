import { TapEventPointerType } from "./use-tap.types";

/**
 * Determines whether a pointer event should be handled based on event options.
 *
 * @param {PointerEvent} event - The pointer event to evaluate
 * @param {Object} options - Event handling options
 * @param {TapEventPointerType[]} options.eventPointerTypes - Allowed pointer types for the event
 * @returns {boolean} True if the event should be handled, false otherwise
 *
 * @example
 * const shouldHandle = shouldHandleEvent(event, {
 *   eventPointerTypes: [TapEventPointerTypes.Touch]
 * });
 */
export const shouldHandleEvent = (
  event: PointerEvent,
  options: {
    eventPointerTypes: TapEventPointerType[];
  },
) => {
  if (!event.isPrimary) {
    return false;
  }
  if (
    !options.eventPointerTypes.includes(
      event.pointerType as TapEventPointerType,
    )
  ) {
    return false;
  }

  return true;
};
