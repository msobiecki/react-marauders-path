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

export const normalizeKey = (key: string): string => {
  if (!key) return key;

  const trimmed = key.trim();

  const upper = trimmed.toUpperCase();
  if (SPECIAL_KEYS[upper]) return SPECIAL_KEYS[upper];

  if (trimmed.length === 1) return trimmed.toLowerCase();

  return trimmed[0].toUpperCase() + trimmed.slice(1).toLowerCase();
};

export const normalizeKeySequence = (sequence: string): string => {
  // split chords by "+" and normalize each part
  return sequence
    .split(" ")
    .map((part) =>
      part
        .split("+")
        .map((key) => normalizeKey(key))
        .join("+"),
    )
    .join(" ");
};
