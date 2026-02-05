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
