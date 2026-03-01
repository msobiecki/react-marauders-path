import { describe, it, expect } from "vitest";

import { shouldHandleEvent } from "./event-guards";
import { PointerEventPointerTypes } from "./use-pointer.types";

describe("shouldHandleEvent", () => {
  it("should return true for primary event with allowed pointer type", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PointerEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PointerEventPointerTypes.Touch],
    });

    expect(result).toBe(true);
  });

  it("should return false for non-primary event", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: false,
      pointerType: PointerEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PointerEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("should return false when pointer type is not allowed", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PointerEventPointerTypes.Mouse,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [PointerEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("should return true when pointer type is included in allowed types", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: PointerEventPointerTypes.Pen,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [
        PointerEventPointerTypes.Touch,
        PointerEventPointerTypes.Pen,
      ],
    });

    expect(result).toBe(true);
  });
});
