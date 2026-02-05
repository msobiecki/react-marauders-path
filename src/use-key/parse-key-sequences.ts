import type { SequenceState, KeyEvent } from "./use-key.types";

export const parseKeySequences = (input: KeyEvent): SequenceState[] => {
  const keys = Array.isArray(input) ? input : [input];

  return keys.map((key) => {
    if (typeof key === "string" && key.includes(" ")) {
      return { key, chord: key.split(" "), index: 0, timeout: null };
    }

    return { key, chord: [key], index: 0, timeout: null };
  });
};
