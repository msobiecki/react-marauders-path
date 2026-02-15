import { describe, it, expect } from "vitest";

import { normalizeKey, normalizeKeySequence } from "./normalize-key";

describe("normalizeKey", () => {
  describe("special keys", () => {
    it("should normalize enter variants", () => {
      expect(normalizeKey("enter")).toBe("Enter");
      expect(normalizeKey("ENTER")).toBe("Enter");
      expect(normalizeKey("Enter")).toBe("Enter");
    });

    it("should normalize escape variants", () => {
      expect(normalizeKey("esc")).toBe("Escape");
      expect(normalizeKey("escape")).toBe("Escape");
      expect(normalizeKey("ESC")).toBe("Escape");
      expect(normalizeKey("ESCAPE")).toBe("Escape");
    });

    describe("space key variants normalization", () => {
      it("should normalize space variants", () => {
        expect(normalizeKey("space")).toBe(" ");
        expect(normalizeKey("SPACE")).toBe(" ");
      });

      it("should normalize ' ' (space)", () => {
        expect(normalizeKey(" ")).toBe(" ");
      });
    });

    it("should normalize tab variants", () => {
      expect(normalizeKey("tab")).toBe("Tab");
      expect(normalizeKey("TAB")).toBe("Tab");
    });

    it("should normalize shift variants", () => {
      expect(normalizeKey("shift")).toBe("Shift");
      expect(normalizeKey("SHIFT")).toBe("Shift");
    });

    it("should normalize control/ctrl variants", () => {
      expect(normalizeKey("control")).toBe("Control");
      expect(normalizeKey("ctrl")).toBe("Control");
      expect(normalizeKey("CONTROL")).toBe("Control");
      expect(normalizeKey("CTRL")).toBe("Control");
    });

    it("should normalize alt variants", () => {
      expect(normalizeKey("alt")).toBe("Alt");
      expect(normalizeKey("ALT")).toBe("Alt");
    });

    it("should normalize meta variants", () => {
      expect(normalizeKey("meta")).toBe("Meta");
      expect(normalizeKey("META")).toBe("Meta");
    });

    it("should normalize arrow key variants", () => {
      expect(normalizeKey("arrowup")).toBe("ArrowUp");
      expect(normalizeKey("arrowdown")).toBe("ArrowDown");
      expect(normalizeKey("arrowleft")).toBe("ArrowLeft");
      expect(normalizeKey("arrowright")).toBe("ArrowRight");
    });

    it("should normalize other special key variants", () => {
      expect(normalizeKey("backspace")).toBe("Backspace");
      expect(normalizeKey("BACKSPACE")).toBe("Backspace");
      expect(normalizeKey("Backspace")).toBe("Backspace");
      expect(normalizeKey("delete")).toBe("Delete");
      expect(normalizeKey("DELETE")).toBe("Delete");
      expect(normalizeKey("Delete")).toBe("Delete");
      expect(normalizeKey("del")).toBe("Delete");
      expect(normalizeKey("DEL")).toBe("Delete");
      expect(normalizeKey("insert")).toBe("Insert");
      expect(normalizeKey("INSERT")).toBe("Insert");
      expect(normalizeKey("Insert")).toBe("Insert");
      expect(normalizeKey("home")).toBe("Home");
      expect(normalizeKey("HOME")).toBe("Home");
      expect(normalizeKey("Home")).toBe("Home");
      expect(normalizeKey("end")).toBe("End");
      expect(normalizeKey("END")).toBe("End");
      expect(normalizeKey("End")).toBe("End");
      expect(normalizeKey("pageup")).toBe("PageUp");
      expect(normalizeKey("PAGEUP")).toBe("PageUp");
      expect(normalizeKey("PageUp")).toBe("PageUp");
      expect(normalizeKey("pagedown")).toBe("PageDown");
      expect(normalizeKey("PAGEDOWN")).toBe("PageDown");
      expect(normalizeKey("PageDown")).toBe("PageDown");
      expect(normalizeKey("capslock")).toBe("CapsLock");
      expect(normalizeKey("CAPSLOCK")).toBe("CapsLock");
      expect(normalizeKey("CapsLock")).toBe("CapsLock");
    });

    it("should normalize 'any' special key variants", () => {
      expect(normalizeKey("any")).toBe("Any");
      expect(normalizeKey("ANY")).toBe("Any");
    });
  });

  describe("single character key variants", () => {
    it("should lowercase single letter characters", () => {
      expect(normalizeKey("a")).toBe("a");
      expect(normalizeKey("A")).toBe("a");
      expect(normalizeKey("z")).toBe("z");
      expect(normalizeKey("Z")).toBe("z");
    });

    it("should lowercase single digit characters", () => {
      expect(normalizeKey("0")).toBe("0");
      expect(normalizeKey("5")).toBe("5");
      expect(normalizeKey("9")).toBe("9");
    });

    it("should handle single special characters", () => {
      expect(normalizeKey("!")).toBe("!");
      expect(normalizeKey("@")).toBe("@");
      expect(normalizeKey("/")).toBe("/");
    });
  });

  describe("multi-character key variants", () => {
    it("should capitalize first letter and lowercase the rest", () => {
      expect(normalizeKey("numpad1")).toBe("Numpad1");
      expect(normalizeKey("NUMPAD1")).toBe("Numpad1");
      expect(normalizeKey("F1")).toBe("F1");
      expect(normalizeKey("f12")).toBe("F12");
    });
  });

  describe("edge case variants", () => {
    it("should handle empty string", () => {
      expect(normalizeKey("")).toBe("");
    });

    it("should handle strings with leading/trailing spaces", () => {
      expect(normalizeKey("  space  ")).toBe(" ");
      expect(normalizeKey("  a  ")).toBe("a");
    });

    it("should handle all lock key variants", () => {
      expect(normalizeKey("numlock")).toBe("NumLock");
      expect(normalizeKey("scrolllock")).toBe("ScrollLock");
      expect(normalizeKey("NUMLOCK")).toBe("NumLock");
      expect(normalizeKey("SCROLLLOCK")).toBe("ScrollLock");
    });

    it("should handle context menu key variants", () => {
      expect(normalizeKey("contextmenu")).toBe("ContextMenu");
      expect(normalizeKey("CONTEXTMENU")).toBe("ContextMenu");
    });

    it("should handle special character key variants", () => {
      expect(normalizeKey("-")).toBe("-");
      expect(normalizeKey("=")).toBe("=");
      expect(normalizeKey("[")).toBe("[");
      expect(normalizeKey("]")).toBe("]");
      expect(normalizeKey("+")).toBe("+");
    });
  });
});

describe("normalizeKeySequence", () => {
  it("should normalize single key variants", () => {
    expect(normalizeKeySequence("a")).toBe("a");
    expect(normalizeKeySequence("Enter")).toBe("Enter");
  });

  it("should normalize combination (key variants connected with +)", () => {
    expect(normalizeKeySequence("shift+a")).toBe("Shift+a");
    expect(normalizeKeySequence("CTRL+ALT+DEL")).toBe("Control+Alt+Delete");
    expect(normalizeKeySequence("control+shift+s")).toBe("Control+Shift+s");
  });

  it("should normalize sequence (key variants separated by spaces)", () => {
    expect(normalizeKeySequence("a b c")).toBe("a b c");
    expect(normalizeKeySequence("Shift+A Enter")).toBe("Shift+a Enter");
  });

  it("should normalize complex sequences with both combination and sequence variants", () => {
    expect(normalizeKeySequence("shift+a shift+b c")).toBe("Shift+a Shift+b c");
    expect(normalizeKeySequence("CTRL+S CTRL+V")).toBe("Control+s Control+v");
  });

  it("should handle mixed case special key variants", () => {
    expect(normalizeKeySequence("ARROWUP ArrowDown")).toBe("ArrowUp ArrowDown");
    expect(normalizeKeySequence("escape+shift")).toBe("Escape+Shift");
  });

  it("should normalize long sequence variants ", () => {
    expect(normalizeKeySequence("ctrl+s ctrl+v ctrl+c")).toBe(
      "Control+s Control+v Control+c",
    );
  });

  it("should handle sequences with special key variants ", () => {
    expect(normalizeKeySequence("ArrowUp ArrowUp ArrowUp")).toBe(
      "ArrowUp ArrowUp ArrowUp",
    );
    expect(normalizeKeySequence("Home End")).toBe("Home End");
  });

  it("should preserve order in combination", () => {
    expect(normalizeKeySequence("a+shift+control")).toBe("a+Shift+Control");
  });

  describe("space key variants normalization", () => {
    it("should normalize 'space. ' to '   '", () => {
      expect(normalizeKeySequence("space  ")).toBe("   ");
    });

    it("should normalize '   ' (space) to '   '", () => {
      expect(normalizeKeySequence("   ")).toBe("   ");
    });

    it("should normalize 'a  ' (space) to 'a  '", () => {
      expect(normalizeKeySequence("a  ")).toBe("a  ");
    });
  });

  describe("special case variants", () => {
    it("should preserve multiple spaces in sequence", () => {
      expect(normalizeKeySequence("a  b")).toBe("a  b");
    });
  });
});
