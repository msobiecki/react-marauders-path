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

  describe("single key patterns", () => {
    it("should invoke callback on keyup event", () => {
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

    describe("case-insensitive special keys", () => {
      it("should handle case-insensitive special key patterns", () => {
        const callback = vi.fn();
        renderHook(() => useKey("A", callback, { eventType: "keyup" }));
        dispatchKeyboardEvent("keyup", "a");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
      });
    });

    describe("special keys", () => {
      it("should handle special keys like Enter", () => {
        const callback = vi.fn();
        renderHook(() => useKey("Enter", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "Enter");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Enter",
        );
      });

      it("should handle arrow keys", () => {
        const callback = vi.fn();
        renderHook(() => useKey("ArrowUp", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "ArrowUp");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "ArrowUp",
        );
      });

      it("should handle Escape key", () => {
        const callback = vi.fn();
        renderHook(() => useKey("Escape", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "Escape");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Escape",
        );
      });

      it("should handle Delete key", () => {
        const callback = vi.fn();
        renderHook(() => useKey("Delete", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "Delete");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Delete",
        );
      });

      describe("case-insensitive key patterns", () => {
        it("should handle case-insensitive key patterns", () => {
          const callback = vi.fn();
          renderHook(() => useKey("enter", callback, { eventType: "keyup" }));
          dispatchKeyboardEvent("keyup", "Enter");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Enter",
          );
        });
      });
    });

    describe("function keys", () => {
      it("should handle function keys", () => {
        const callback = vi.fn();
        renderHook(() => useKey("F1", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "F1");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "F1");
      });

      describe("case-insensitive function keys", () => {
        it("should handle case-insensitive function key patterns", () => {
          const callback = vi.fn();
          renderHook(() => useKey("f1", callback, { eventType: "keyup" }));
          dispatchKeyboardEvent("keyup", "F1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1",
          );
        });
      });
    });

    it("should handle number keys", () => {
      const callback = vi.fn();
      renderHook(() => useKey("1", callback, { eventType: "keyup" }));

      dispatchKeyboardEvent("keyup", "1");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");
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
  });

  describe("combination key patterns", () => {
    it("should invoke callback on a+b combination keyup event", () => {
      const callback = vi.fn();
      renderHook(() => useKey("a+b", callback, { eventType: "keyup" }));

      dispatchKeyboardEvent("keydown", "a");
      dispatchKeyboardEvent("keydown", "b");
      dispatchKeyboardEvent("keyup", "a");
      dispatchKeyboardEvent("keyup", "b");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a+b");
    });

    it("should invoke callback on a+b combination keydown event", () => {
      const callback = vi.fn();
      renderHook(() => useKey("a+b", callback, { eventType: "keydown" }));

      dispatchKeyboardEvent("keydown", "a");
      dispatchKeyboardEvent("keydown", "b");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a+b");
    });
  });

  describe("sequence key patterns", () => {
    it("should handle sequence of keys with default threshold", () => {
      const callback = vi.fn();
      renderHook(() => useKey("a b c", callback, { eventType: "keyup" }));

      dispatchKeyboardEvent("keyup", "a");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "b");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "c");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a b c");
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

  describe("array patterns with single keys", () => {
    it("should invoke callback for array of patterns", () => {
      const callback = vi.fn();
      renderHook(() =>
        useKey(["a", "b", "c"], callback, { eventType: "keyup" }),
      );

      dispatchKeyboardEvent("keyup", "b");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");
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

    it("should handle array with special keys", () => {
      const callback = vi.fn();
      renderHook(() =>
        useKey(["Enter", "Escape", "Delete"], callback, { eventType: "keyup" }),
      );

      dispatchKeyboardEvent("keyup", "Escape");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(KeyboardEvent),
        "Escape",
      );
    });
  });

  describe("array patterns with combination keys", () => {
    it("should invoke callback on a+b combination keyup event", () => {
      const callback = vi.fn();
      renderHook(() => useKey(["a+b"], callback, { eventType: "keyup" }));

      dispatchKeyboardEvent("keydown", "a");
      dispatchKeyboardEvent("keydown", "b");
      dispatchKeyboardEvent("keyup", "a");
      dispatchKeyboardEvent("keyup", "b");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a+b");
    });

    it("should invoke callback on a+b combination keydown event", () => {
      const callback = vi.fn();
      renderHook(() => useKey(["a+b"], callback, { eventType: "keydown" }));

      dispatchKeyboardEvent("keydown", "a");
      dispatchKeyboardEvent("keydown", "b");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a+b");
    });
  });

  describe("array patterns with sequence keys", () => {
    it("should handle multiple sequence patterns", () => {
      const callback = vi.fn();
      renderHook(() =>
        useKey(["a b", "x y z"], callback, {
          eventType: "keyup",
          sequenceThreshold: 400,
        }),
      );

      // First pattern: a b
      dispatchKeyboardEvent("keyup", "a");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "b");

      expect(callback).toHaveBeenCalledTimes(1);

      // Reset for second pattern: x y z
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "x");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "y");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "z");

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should handle array with mixed patterns", () => {
      const callback = vi.fn();
      renderHook(() =>
        useKey(["a", "b c d"], callback, {
          eventType: "keyup",
          sequenceThreshold: 300,
        }),
      );

      // First pattern: single key 'a'
      dispatchKeyboardEvent("keyup", "a");

      expect(callback).toHaveBeenCalledTimes(1);

      // Second pattern: sequence 'b c d'
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "b");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "c");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "d");

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it("should handle long sequences in array", () => {
      const callback = vi.fn();
      renderHook(() =>
        useKey(["a b c d e", "x y"], callback, {
          eventType: "keyup",
          sequenceThreshold: 1000,
        }),
      );

      // First pattern: long sequence
      const keys = ["a", "b", "c", "d", "e"];
      keys.forEach((key) => {
        dispatchKeyboardEvent("keyup", key);
        vi.advanceTimersByTime(150);
      });

      expect(callback).toHaveBeenCalledTimes(1);

      // Second pattern: short sequence
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "x");
      vi.advanceTimersByTime(100);
      dispatchKeyboardEvent("keyup", "y");

      expect(callback).toHaveBeenCalledTimes(2);
    });

    // it("should handle array with combination patterns", () => {
    //   const callback = vi.fn();
    //   renderHook(() =>
    //     useKey(["ctrl+a b c"], callback, { eventType: "keyup" }),
    //   );

    //   dispatchKeyboardEvent("keydown", "Control");
    //   dispatchKeyboardEvent("keydown", "a");
    //   dispatchKeyboardEvent("keyup", "Control");
    //   dispatchKeyboardEvent("keyup", "a");
    //   vi.advanceTimersByTime(150);
    //   dispatchKeyboardEvent("keyup", "b");
    //   vi.advanceTimersByTime(150);
    //   dispatchKeyboardEvent("keyup", "c");

    //   expect(callback).toHaveBeenCalledTimes(1);
    //   expect(callback).toHaveBeenCalledWith(
    //     expect.any(KeyboardEvent),
    //     "Control+a b c",
    //   );
    // });
  });

  describe("hook options", () => {
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

    describe("sequenceThreshold option", () => {
      it("should invoke callback when sequence is completed within threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b c", callback, {
            eventType: "keyup",
            sequenceThreshold: 500,
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should reset sequence when threshold is exceeded", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b c", callback, {
            eventType: "keyup",
            sequenceThreshold: 300,
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(500); // Exceeds threshold
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).not.toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should allow sequence to complete with tight threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b", callback, {
            eventType: "keyup",
            sequenceThreshold: 50,
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(20);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a b");
      });

      it("should reset sequence and restart if wrong key pressed", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b c", callback, {
            eventType: "keyup",
            sequenceThreshold: 500,
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "x"); // Wrong key
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should handle multiple sequence patterns with different thresholds", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey(["a b", "x y z"], callback, {
            eventType: "keyup",
            sequenceThreshold: 400,
          }),
        );

        // First pattern: a b
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);

        // Reset for second pattern: x y z
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "x");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "y");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "z");

        expect(callback).toHaveBeenCalledTimes(2);
      });

      it("should work with default threshold value", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(500);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a b");
      });

      it("should exceed default threshold and reset sequence", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(1500); // Exceeds default 1000ms threshold
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).not.toHaveBeenCalledTimes(1);
      });

      it("should handle keydown event type with threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b c", callback, {
            eventType: "keydown",
            sequenceThreshold: 300,
          }),
        );

        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "c");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should allow zero threshold for immediate sequence", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b", callback, { eventType: "keyup", sequenceThreshold: 0 }),
        );

        dispatchKeyboardEvent("keyup", "a");
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a b");
      });

      it("should handle long sequences within threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a b c d e", callback, {
            eventType: "keyup",
            sequenceThreshold: 1000,
          }),
        );

        const keys = ["a", "b", "c", "d", "e"];
        keys.forEach((key) => {
          dispatchKeyboardEvent("keyup", key);
          vi.advanceTimersByTime(150);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c d e",
        );
      });
    });
  });

  describe("lifecycle", () => {
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
