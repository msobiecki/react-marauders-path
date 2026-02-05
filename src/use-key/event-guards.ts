/**
 * Determines whether a keyboard event should be handled based on event options.
 *
 * @param {KeyboardEvent} event - The keyboard event to evaluate
 * @param {Object} options - Event handling options
 * @param {boolean} options.once - If true, event should only be handled once
 * @param {boolean} options.repeat - If true, repeated key presses are allowed
 * @param {boolean} options.firedOnce - If true, indicates the event has already fired once
 * @returns {boolean} True if the event should be handled, false otherwise
 *
 * @example
 * const shouldHandle = shouldHandleKeyboardEvent(event, {
 *   once: true,
 *   repeat: false,
 *   firedOnce: false
 * });
 */
export const shouldHandleKeyboardEvent = (
  event: KeyboardEvent,
  options: {
    once: boolean;
    repeat: boolean;
    firedOnce: boolean;
  },
) => {
  if (options.once && options.firedOnce) {
    return false;
  }
  if (!options.repeat && event.repeat) {
    return false;
  }
  return true;
};
