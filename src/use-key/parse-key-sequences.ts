import { normalizeKeySequence } from "./normalize-key";
import { SequenceState, KeyEvent } from "./use-key.types";

/**
 * Parses keyboard event patterns into sequence states.
 *
 * Converts key patterns (single keys, combinations, sequences, or arrays thereof)
 * into SequenceState objects with normalized keys and tracking properties.
 * Sequences with spaces are split into arrays.
 *
 * @param {KeyEvent} input - A single key pattern or array of key patterns
 * @returns {SequenceState[]} Array of parsed sequence states
 *
 * @example
 * parseKeySequences('a')           // [{ key: 'a', chord: ['a'], index: 0, sequenceTimeout: null }]
 * parseKeySequences('shift+a')     // [{ key: 'Shift+a', chord: ['Shift+a'], index: 0, sequenceTimeout: null }]
 * parseKeySequences('a b c')       // [{ key: 'a b c', chord: ['a', 'b', 'c'], index: 0, sequenceTimeout: null }]
 * parseKeySequences(['a', 'b'])    // [{ ... }, { ... }]
 */
export const parseKeySequences = (input: KeyEvent): SequenceState[] => {
  const keys = Array.isArray(input) ? input : [input];

  return keys.map((key) => {
    if (typeof key === "string" && key.includes(" ")) {
      const normalizedKey = normalizeKeySequence(key);
      return {
        key: normalizedKey,
        chord: normalizedKey.split(" "),
        index: 0,
        sequenceTimeout: null,
      };
    }

    const normalizedKey = normalizeKeySequence(key);
    return {
      key: normalizedKey,
      chord: [normalizedKey],
      index: 0,
      sequenceTimeout: null,
    };
  });
};
