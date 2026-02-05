import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useKey, { useKeyOnce } from "./use-key";

// Helper to create and dispatch keyboard events
const dispatchKeyboardEvent = (
  type: "keydown" | "keyup",
  key: string,
  options: Partial<KeyboardEventInit> = {},
) => {
  const event = new KeyboardEvent(type, {
    key,
    code: `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  globalThis.dispatchEvent(event);
  return event;
};

describe("useKey hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should invoke callback on single key press", () => {
    const callback = vi.fn();
    renderHook(() => useKey("a", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should invoke callback on keydown event", () => {
    const callback = vi.fn();
    renderHook(() => useKey("b", callback, { eventType: "keydown" }));

    dispatchKeyboardEvent("keydown", "b");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should not invoke callback for non-matching keys", () => {
    const callback = vi.fn();
    renderHook(() => useKey("a", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "b");

    expect(callback).not.toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should invoke callback for array of patterns", () => {
    const callback = vi.fn();
    renderHook(() => useKey(["a", "b", "c"], callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "b");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should handle case-insensitive key patterns", () => {
    const callback = vi.fn();
    renderHook(() => useKey("enter", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "Enter");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "Enter");
  });

  it("should handle special keys like Enter", () => {
    const callback = vi.fn();
    renderHook(() => useKey("Enter", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "Enter");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "Enter");
  });

  it("should handle arrow keys", () => {
    const callback = vi.fn();
    renderHook(() => useKey("ArrowUp", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "ArrowUp");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "ArrowUp");
  });

  it("should handle Escape key", () => {
    const callback = vi.fn();
    renderHook(() => useKey("Escape", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "Escape");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "Escape");
  });

  it("should handle Delete key", () => {
    const callback = vi.fn();
    renderHook(() => useKey("Delete", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "Delete");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "Delete");
  });

  it("should respect eventRepeat option - false", () => {
    const callback = vi.fn();
    renderHook(() =>
      useKey("a", callback, { eventType: "keyup", eventRepeat: false }),
    );

    const event = new KeyboardEvent("keyup", {
      key: "a",
      repeat: true,
      bubbles: true,
    });
    globalThis.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should respect eventRepeat option - true", () => {
    const callback = vi.fn();
    renderHook(() =>
      useKey("a", callback, { eventType: "keyup", eventRepeat: true }),
    );

    const event = new KeyboardEvent("keyup", {
      key: "a",
      repeat: true,
      bubbles: true,
    });
    globalThis.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should respect eventOnce option", () => {
    const callback = vi.fn();
    renderHook(() =>
      useKey("a", callback, { eventType: "keyup", eventOnce: true }),
    );

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should handle function keys", () => {
    const callback = vi.fn();
    renderHook(() => useKey("F1", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "F1");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "F1");
  });

  it("should handle multiple function keys", () => {
    const callback = vi.fn();
    renderHook(() =>
      useKey(["F1", "F2", "F12"], callback, { eventType: "keyup" }),
    );

    dispatchKeyboardEvent("keyup", "F12");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "F12");
  });

  it("should handle number keys", () => {
    const callback = vi.fn();
    renderHook(() => useKey("1", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "1");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");
  });

  it("should cleanup listener on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKey("a", callback));

    unmount();
    dispatchKeyboardEvent("keyup", "a");

    expect(callback).not.toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should update listener when key pattern changes", () => {
    const callback = vi.fn();
    let key = "a";
    const { rerender } = renderHook(() => useKey(key, callback), {
      initialProps: { key },
    });

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

    key = "b";
    rerender();

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

    dispatchKeyboardEvent("keyup", "b");

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should pass event object to callback", () => {
    const callback = vi.fn();
    renderHook(() => useKey("a", callback, { eventType: "keyup" }));

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should allow preventDefault on callback", () => {
    const callback = vi.fn((event) => {
      event.preventDefault();
    });
    renderHook(() => useKey("a", callback, { eventType: "keyup" }));

    const event = dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
    expect(event.defaultPrevented).toBe(true);
  });

  it("should handle complex key patterns with multiple options", () => {
    const callback = vi.fn();
    renderHook(() =>
      useKey("Enter", callback, {
        eventType: "keydown",
        eventRepeat: false,
        eventStopImmediatePropagation: true,
      }),
    );

    dispatchKeyboardEvent("keydown", "Enter");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "Enter");
  });
});

describe("useKeyOnce hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should invoke callback once on key press", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("a", callback));

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should invoke callback with keydown event type", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("a", callback, { eventType: "keydown" }));

    dispatchKeyboardEvent("keydown", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should not invoke callback for non-matching keys", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("a", callback));

    dispatchKeyboardEvent("keyup", "b");

    expect(callback).not.toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should handle multiple patterns", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce(["a", "b", "c"], callback));

    dispatchKeyboardEvent("keyup", "b");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");

    dispatchKeyboardEvent("keyup", "b");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should handle special keys", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("Enter", callback));

    dispatchKeyboardEvent("keyup", "Enter");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "Enter");
  });

  it("should cleanup on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyOnce("a", callback));

    unmount();
    dispatchKeyboardEvent("keyup", "a");

    expect(callback).not.toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should update pattern when rerendered", () => {
    const callback = vi.fn();
    let pattern = "a";
    const { rerender } = renderHook(() => useKeyOnce(pattern, callback));

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

    pattern = "b";
    rerender();

    const newCallback = vi.fn();
    renderHook(({ key, cb }) => useKeyOnce(key, cb), {
      initialProps: { key: pattern, cb: newCallback },
    });

    dispatchKeyboardEvent("keyup", "b");

    expect(newCallback).toHaveBeenCalledTimes(1);
    expect(newCallback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
  });

  it("should handle arrow keys", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("ArrowDown", callback));

    dispatchKeyboardEvent("keyup", "ArrowDown");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.any(KeyboardEvent),
      "ArrowDown",
    );
  });

  it("should pass correct event object to callback", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("a", callback));

    dispatchKeyboardEvent("keyup", "a");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });

  it("should handle function keys", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("F5", callback));

    dispatchKeyboardEvent("keyup", "F5");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "F5");

    dispatchKeyboardEvent("keyup", "F5");

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "F5");
  });

  it("should respect eventRepeat false option", () => {
    const callback = vi.fn();
    renderHook(() => useKeyOnce("a", callback, { eventRepeat: false }));

    const event = new KeyboardEvent("keyup", {
      key: "a",
      repeat: true,
      bubbles: true,
    });
    globalThis.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
  });
});
