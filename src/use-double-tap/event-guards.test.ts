import { describe, it, expect } from "vitest";

import { shouldHandleEvent } from "./event-guards";
import { DoubleTapEventPointerTypes } from "./use-double-tap.types";

describe("shouldHandleEvent", () => {
  it("should return true for primary event with allowed pointer type", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: DoubleTapEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [DoubleTapEventPointerTypes.Touch],
    });

    expect(result).toBe(true);
  });

  it("should return false for non-primary event", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: false,
      pointerType: DoubleTapEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [DoubleTapEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("should return false when pointer type is not allowed", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: DoubleTapEventPointerTypes.Mouse,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [DoubleTapEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("should return true when pointer type is included in allowed types", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: DoubleTapEventPointerTypes.Pen,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [
        DoubleTapEventPointerTypes.Touch,
        DoubleTapEventPointerTypes.Pen,
      ],
    });

    expect(result).toBe(true);
  });
});
