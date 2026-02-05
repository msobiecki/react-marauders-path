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
