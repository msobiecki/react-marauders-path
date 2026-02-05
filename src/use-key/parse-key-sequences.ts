import { normalizeKeySequence } from "./normalize-key";
import type { SequenceState, KeyEvent } from "./use-key.types";

export const parseKeySequences = (input: KeyEvent): SequenceState[] => {
  const keys = Array.isArray(input) ? input : [input];

  return keys.map((key) => {
    if (typeof key === "string" && key.includes(" ")) {
      const normalizedKey = normalizeKeySequence(key);
      return {
        key: normalizedKey,
        chord: normalizedKey.split(" "),
        index: 0,
        timeout: null,
      };
    }

    const normalizedKey = normalizeKeySequence(key);
    return {
      key: normalizedKey,
      chord: [normalizedKey],
      index: 0,
      timeout: null,
    };
  });
};
