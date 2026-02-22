import { describe, it, expect } from "vitest";

import { shouldHandleWheelEvent } from "./event-guards";

describe("shouldHandleWheelEvent", () => {
  it("should return true when no restrictions are set", () => {
    const result = shouldHandleWheelEvent({
      once: false,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });

  it("should return false when 'once' is true and 'firedOnce' is true", () => {
    const result = shouldHandleWheelEvent({
      once: true,
      firedOnce: true,
    });
    expect(result).toBe(false);
  });

  it("should return true when 'once' is true but 'firedOnce' is false", () => {
    const result = shouldHandleWheelEvent({
      once: true,
      firedOnce: false,
    });
    expect(result).toBe(true);
  });
});
