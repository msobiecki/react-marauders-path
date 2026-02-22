/**
 * Determines whether a wheel event should be handled based on event options.
 *
 * @param {Object} options - Event handling options
 * @param {boolean} options.once - If true, event should only be handled once
 * @param {boolean} options.firedOnce - If true, indicates the event has already fired once
 * @returns {boolean} True if the event should be handled, false otherwise
 *
 * @example
 * const shouldHandle = shouldHandleWheelEvent({
 *   once: true,
 *   firedOnce: false
 * });
 */
export const shouldHandleWheelEvent = (options: {
  once: boolean;
  firedOnce: boolean;
}) => {
  if (options.once && options.firedOnce) {
    return false;
  }

  return true;
};
