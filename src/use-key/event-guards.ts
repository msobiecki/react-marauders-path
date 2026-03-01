/**
 * Determines whether a keyboard event should be handled based on event options.
 *
 * @param {KeyboardEvent} event - The keyboard event to evaluate
 * @param {Object} options - Event handling options
 * @param {boolean} options.repeat - If true, repeated key presses are allowed
 * @returns {boolean} True if the event should be handled, false otherwise
 *
 * @example
 * const shouldHandle = shouldHandleEvent(event, {
 *   repeat: false
 * });
 */
export const shouldHandleEvent = (
  event: KeyboardEvent,
  options: {
    repeat: boolean;
  },
) => {
  if (!options.repeat && event.repeat) {
    return false;
  }
  return true;
};
