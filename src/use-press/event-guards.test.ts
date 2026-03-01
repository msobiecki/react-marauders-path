import { describe, it, expect } from "vitest";

import { shouldHandleEvent } from "./event-guards";
import { PressEventPointerTypes } from "./use-press.types";

describe("shouldHandleEvent", () => {
  it("returns true for primary event with allowed pointer type", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PressEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PressEventPointerTypes.Touch],
    });

    expect(result).toBe(true);
  });

  it("returns false for non-primary event", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: false,
      pointerType: PressEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PressEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("returns false when pointer type is not allowed", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PressEventPointerTypes.Mouse,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PressEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("returns true when pointer type is included in allowed types", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PressEventPointerTypes.Pen,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [
        PressEventPointerTypes.Touch,
        PressEventPointerTypes.Pen,
      ],
    });

    expect(result).toBe(true);
  });
});
