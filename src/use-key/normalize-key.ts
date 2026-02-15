/**
 * Map of special key names to their normalized values.
 * Supports various aliases for the same key (e.g., ESC and ESCAPE both map to Escape).
 *
 * @type {Record<string, string>}
 * @example
 * SPECIAL_KEYS['ENTER'] // 'Enter'
 * SPECIAL_KEYS['ESC']   // 'Escape'
 * SPECIAL_KEYS['CTRL']  // 'Control'
 */
export const SPECIAL_KEYS: Record<string, string> = {
  ENTER: "Enter",
  ESC: "Escape",
  ESCAPE: "Escape",
  SPACE: " ",
  TAB: "Tab",
  SHIFT: "Shift",
  CONTROL: "Control",
  CTRL: "Control",
  ALT: "Alt",
  META: "Meta",
  ARROWUP: "ArrowUp",
  ARROWDOWN: "ArrowDown",
  ARROWLEFT: "ArrowLeft",
  ARROWRIGHT: "ArrowRight",
  BACKSPACE: "Backspace",
  DELETE: "Delete",
  DEL: "Delete",
  INSERT: "Insert",
  HOME: "Home",
  END: "End",
  PAGEUP: "PageUp",
  PAGEDOWN: "PageDown",
  CONTEXTMENU: "ContextMenu",
  CAPSLOCK: "CapsLock",
  NUMLOCK: "NumLock",
  SCROLLLOCK: "ScrollLock",
  ANY: "Any", // Special key to match any key in sequences
};

/**
 * Normalizes a single key string to its standard representation.
 *
 * Special keys are mapped to their standard names (e.g., 'enter' → 'Enter').
 * Single character keys are lowercased (e.g., 'A' → 'a').
 * Multi-character keys are capitalized (e.g., 'numpad1' → 'Numpad1').
 *
 * @param {string} key - The key string to normalize
 * @returns {string} The normalized key
 *
 * @example
 * normalizeKey('enter')      // 'Enter'
 * normalizeKey('SHIFT')      // 'Shift'
 * normalizeKey('a')          // 'a'
 * normalizeKey('F12')        // 'F12'
 */
export const normalizeKey = (key: string): string => {
  if (!key) {
    return key;
  }

  const trimmed = key.trim();

  const upper = trimmed.toUpperCase();
  if (SPECIAL_KEYS[upper]) {
    return SPECIAL_KEYS[upper];
  }

  if (trimmed.length === 1) {
    return trimmed.toLowerCase();
  }

  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Normalizes a key sequence or combinations string.
 *
 * Processes sequences separated by spaces and combinations separated by + signs.
 * Each component is individually normalized using normalizeKey().
 *
 * @param {string} sequence - The key sequence or combination to normalize
 * @returns {string} The normalized sequence
 *
 * @example
 * normalizeKeySequence('shift+a')        // 'Shift+a'
 * normalizeKeySequence('CTRL+ALT+DEL')  // 'Control+Alt+Delete'
 * normalizeKeySequence('a b c')          // 'a b c'
 * normalizeKeySequence('Shift+A Enter')  // 'Shift+a Enter'
 */
export const normalizeKeySequence = (sequence: string): string => {
  return sequence
    .trim()
    .split(/\s+/)
    .map((part) =>
      part
        .split("+")
        .map((key) => normalizeKey(key))
        .join("+"),
    )
    .join(" ");
};
