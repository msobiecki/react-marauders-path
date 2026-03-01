import { describe, it, expect } from "vitest";

import { shouldHandleEvent } from "./event-guards";
import { TapEventPointerTypes } from "./use-tap.types";

describe("shouldHandleEvent", () => {
  it("returns true for primary event with allowed pointer type", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: TapEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [TapEventPointerTypes.Touch],
    });

    expect(result).toBe(true);
  });

  it("returns false for non-primary event", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: false,
      pointerType: TapEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [TapEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("returns false when pointer type is not allowed", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: TapEventPointerTypes.Mouse,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [TapEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("returns true when pointer type is included in allowed types", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: TapEventPointerTypes.Pen,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [TapEventPointerTypes.Touch, TapEventPointerTypes.Pen],
    });

    expect(result).toBe(true);
  });
});
