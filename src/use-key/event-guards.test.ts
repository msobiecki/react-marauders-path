import { describe, it, expect } from "vitest";

import { shouldHandleKeyboardEvent } from "./event-guards";

describe("shouldHandleKeyboardEvent", () => {
  it("should return true when no restrictions are set", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      once: false,
      repeat: true,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });

  it("should return false when 'once' is true and 'firedOnce' is true", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      once: true,
      repeat: true,
      firedOnce: true,
    });
    expect(result).toBe(false);
  });

  it("should return true when 'once' is true but 'firedOnce' is false", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      once: true,
      repeat: true,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });

  it("should return false when 'repeat' is false and event.repeat is true", () => {
    const event = new KeyboardEvent("keydown", { repeat: true });
    const result = shouldHandleKeyboardEvent(event, {
      once: false,
      repeat: false,
      firedOnce: false,
    });
    expect(result).toBe(false);
  });

  it("should return true when 'repeat' is false but event.repeat is false", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      once: false,
      repeat: false,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });

  it("should return true when 'repeat' is true and event.repeat is true", () => {
    const event = new KeyboardEvent("keydown", { repeat: true });
    const result = shouldHandleKeyboardEvent(event, {
      once: false,
      repeat: true,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });

  it("should handle combined conditions - both 'once' and 'repeat' restrictions", () => {
    const event = new KeyboardEvent("keydown", { repeat: true });
    const result = shouldHandleKeyboardEvent(event, {
      once: true,
      repeat: false,
      firedOnce: false,
    });
    expect(result).toBe(false);
  });

  it("should prioritize 'once' check over 'repeat' check", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      once: true,
      repeat: true,
      firedOnce: true,
    });
    expect(result).toBe(false);
  });

  it("should handle all true options correctly", () => {
    const event = new KeyboardEvent("keydown", { repeat: true });
    const result = shouldHandleKeyboardEvent(event, {
      once: true,
      repeat: true,
      firedOnce: true,
    });
    expect(result).toBe(false);
  });

  it("should allow event when all conditions pass", () => {
    const event = new KeyboardEvent("keydown", { repeat: false });
    const result = shouldHandleKeyboardEvent(event, {
      once: false,
      repeat: true,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });

  it("should block repeated key presses when repeat is false", () => {
    const eventRepeat = new KeyboardEvent("keydown", { repeat: true });
    const eventNoRepeat = new KeyboardEvent("keydown", { repeat: false });
    const result1 = shouldHandleKeyboardEvent(eventRepeat, {
      once: false,
      repeat: false,
      firedOnce: false,
    });
    const result2 = shouldHandleKeyboardEvent(eventNoRepeat, {
      once: false,
      repeat: false,
      firedOnce: false,
    });
    expect(result1).toBe(false);
    expect(result2).toBe(true);
  });
});
