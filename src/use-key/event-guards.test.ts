import { describe, it, expect } from "vitest";

import { shouldHandleKeyboardEvent } from "./event-guards";

describe("shouldHandleKeyboardEvent", () => {
  it("should return true when no restrictions are set", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      repeat: true,
    });
    expect(result).toBe(true);
  });

  it("should return false when 'repeat' is false and event.repeat is true", () => {
    const event = new KeyboardEvent("keydown", { repeat: true });
    const result = shouldHandleKeyboardEvent(event, {
      repeat: false,
    });
    expect(result).toBe(false);
  });

  it("should return true when 'repeat' is false but event.repeat is false", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      repeat: false,
    });
    expect(result).toBe(true);
  });

  it("should return true when 'repeat' is true and event.repeat is true", () => {
    const event = new KeyboardEvent("keydown", { repeat: true });
    const result = shouldHandleKeyboardEvent(event, {
      repeat: true,
    });
    expect(result).toBe(true);
  });
});
