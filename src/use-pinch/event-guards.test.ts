import { describe, it, expect } from "vitest";

import { shouldHandleEvent } from "./event-guards";
import { PinchEventPointerTypes } from "./use-pinch.types";

describe("shouldHandleEvent", () => {
  it("returns true for primary event with allowed pointer type", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PinchEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PinchEventPointerTypes.Touch],
    });

    expect(result).toBe(true);
  });

  it("returns false for non-primary event", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: false,
      pointerType: PinchEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PinchEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("returns false when pointer type is not allowed", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PinchEventPointerTypes.Mouse,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PinchEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("returns true when pointer type is included in allowed types", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PinchEventPointerTypes.Pen,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [
        PinchEventPointerTypes.Touch,
        PinchEventPointerTypes.Pen,
      ],
    });

    expect(result).toBe(true);
  });
});
