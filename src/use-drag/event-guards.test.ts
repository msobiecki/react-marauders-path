import { describe, it, expect } from "vitest";

import { shouldHandleEvent } from "./event-guards";
import { DragEventPointerTypes } from "./use-drag.types";

describe("shouldHandleEvent", () => {
  it("should return true for primary event with allowed pointer type", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: DragEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [DragEventPointerTypes.Touch],
    });

    expect(result).toBe(true);
  });

  it("should return false for non-primary event", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: false,
      pointerType: DragEventPointerTypes.Touch,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [DragEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("should return false when pointer type is not allowed", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: DragEventPointerTypes.Mouse,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [DragEventPointerTypes.Touch],
    });

    expect(result).toBe(false);
  });

  it("should return true when pointer type is included in allowed types", () => {
    const event = new PointerEvent("pointerup", {
      isPrimary: true,
      pointerType: DragEventPointerTypes.Pen,
    });
    const result = shouldHandleEvent(event, {
      eventPointerTypes: [
        DragEventPointerTypes.Touch,
        DragEventPointerTypes.Pen,
      ],
    });

    expect(result).toBe(true);
  });
});
