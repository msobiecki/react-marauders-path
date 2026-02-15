import { describe, it, expect } from "vitest";
import { parseKeySequences } from "./parse-key-sequences";

describe("parseKeySequences", () => {
  describe("single key schema", () => {
    it("should parse a single key schema", () => {
      const result = parseKeySequences("a");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a",
        chord: ["a"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a single key schema", () => {
      const result = parseKeySequences("A");
      expect(result[0]).toEqual({
        key: "a",
        chord: ["a"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse special key schema", () => {
      const result = parseKeySequences("Enter");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "Enter",
        chord: ["Enter"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse special key schema", () => {
      const result = parseKeySequences("ENTER");
      expect(result[0]).toEqual({
        key: "Enter",
        chord: ["Enter"],
        index: 0,
        sequenceTimeout: null,
      });
    });
  });

  describe("combination key schema", () => {
    it("should parse a simple combination schema", () => {
      const result = parseKeySequences("a+b");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a+b",
        chord: [["a", "b"]],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a simple combination schema", () => {
      const result = parseKeySequences("A+B");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a+b",
        chord: [["a", "b"]],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a complex combination schema", () => {
      const result = parseKeySequences("control+shift+s");
      expect(result[0]).toEqual({
        key: "Control+Shift+s",
        chord: [["Control", "Shift", "s"]],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a complex combination schema", () => {
      const result = parseKeySequences("CTRL+SHIFT+S");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "Control+Shift+s",
        chord: [["Control", "Shift", "s"]],
        index: 0,
        sequenceTimeout: null,
      });
    });
  });

  describe("sequential key schema", () => {
    it("should parse a simple sequential schema", () => {
      const result = parseKeySequences("a b");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a b",
        chord: ["a", "b"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a simple sequential schema", () => {
      const result = parseKeySequences("A B");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a b",
        chord: ["a", "b"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a simple sequential schema", () => {
      const result = parseKeySequences("a b c d");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a b c d",
        chord: ["a", "b", "c", "d"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a complex sequential schema", () => {
      const result = parseKeySequences("SHIFT+A ENTER");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "Shift+a Enter",
        chord: [["Shift", "a"], "Enter"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse a complex sequential schema", () => {
      const result = parseKeySequences("a b c ctrl+s");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        key: "a b c Control+s",
        chord: ["a", "b", "c", ["Control", "s"]],
        index: 0,
        sequenceTimeout: null,
      });
    });
  });

  describe("multiple patterns", () => {
    it("should parse array of single key schema", () => {
      const result = parseKeySequences(["a", "b", "c"]);
      expect(result).toHaveLength(3);
      expect(result[0].key).toBe("a");
      expect(result[1].key).toBe("b");
      expect(result[2].key).toBe("c");
    });

    it("should parse array of combination keys schema", () => {
      const result = parseKeySequences(["ctrl+a", "shift+b"]);
      expect(result).toHaveLength(2);
      expect(result[0].key).toBe("Control+a");
      expect(result[1].key).toBe("Shift+b");
    });

    it("should parse array of sequential keys schema", () => {
      const result = parseKeySequences(["a b", "c d"]);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        key: "a b",
        chord: ["a", "b"],
        index: 0,
        sequenceTimeout: null,
      });
      expect(result[1]).toEqual({
        key: "c d",
        chord: ["c", "d"],
        index: 0,
        sequenceTimeout: null,
      });
    });

    it("should parse array of mixed schema", () => {
      const result = parseKeySequences(["a", "ctrl+b", "c d", "shift+a b"]);
      expect(result).toHaveLength(4);
      expect(result[0].chord).toEqual(["a"]);
      expect(result[1].chord).toEqual([["Control", "b"]]);
      expect(result[2].chord).toEqual(["c", "d"]);
      expect(result[3].chord).toEqual([["Shift", "a"], "b"]);
    });
  });

  describe("special cases", () => {
    it("should initialize index to 0", () => {
      const result = parseKeySequences("a");
      expect(result[0].index).toBe(0);
    });

    it("should initialize sequenceTimeout to null", () => {
      const result = parseKeySequences("a");
      expect(result[0].sequenceTimeout).toBe(null);
    });

    it("should handle sequences with numeric keys", () => {
      const result = parseKeySequences("1 2 3 4 5");
      expect(result[0].chord).toEqual(["1", "2", "3", "4", "5"]);
    });

    it("should handle F-keys", () => {
      const result = parseKeySequences("f1 f12");
      expect(result[0].chord).toEqual(["F1", "F12"]);
    });

    it("should handle empty string array", () => {
      const result = parseKeySequences([]);
      expect(result).toHaveLength(0);
    });

    it("should handle deep sequences", () => {
      const result = parseKeySequences("a b c d e f g h i j");
      expect(result[0].chord).toHaveLength(10);
    });

    it("should preserve multiple spaces in sequence", () => {
      const result = parseKeySequences("a  b");
      expect(result[0].chord).toHaveLength(2);
    });
  });
});
