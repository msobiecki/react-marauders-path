/**
 * Invokes a keyboard action callback with optional event modifications.
 *
 * Handles keyboard event processing including preventing default behavior,
 * stopping immediate propagation, and managing one-time event handlers.
 *
 * @param {KeyboardEvent} event - The keyboard event
 * @param {string} key - The normalized key pattern
 * @param {Function} callback - Function to invoke with (event, key). Return true to prevent default.
 * @param {Object} options - Action options
 * @param {boolean} [options.stopImmediate=false] - Whether to stop immediate propagation
 * @param {boolean} [options.once=false] - Whether this is a one-time event
 * @param {Function} [options.onOnce] - Callback to invoke when one-time event fires
 *
 * @example
 * invokeKeyAction(event, 'shift+a', (e, key) => {
 *   console.log(`Pressed ${key}`);
 *   return true; // Prevent default
 * }, { stopImmediate: true });
 */
export const invokeKeyAction = (
  event: KeyboardEvent,
  key: string,
  callback:
    | ((event: KeyboardEvent, key: string) => boolean)
    | ((event: KeyboardEvent, key: string) => void),
  options: {
    stopImmediate?: boolean;
    once?: boolean;
    onOnce?: () => void;
  },
) => {
  if (options.stopImmediate) {
    event.stopImmediatePropagation();
  }

  const shouldPrevent = callback(event, key);
  if (shouldPrevent) {
    event.preventDefault();
  }

  if (options.once) {
    options.onOnce?.();
  }
};
