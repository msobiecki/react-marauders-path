import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useKey from "./use-key";

const dispatchKeyboardEvent = (
  type: "keydown" | "keyup",
  key: string,
  target: EventTarget = globalThis,
  options: Partial<KeyboardEventInit> = {},
) => {
  const event = new KeyboardEvent(type, {
    key,
    code: `Key${key.toUpperCase()}`,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  target.dispatchEvent(event);
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

  describe("single key schema", () => {
    describe("single string", () => {
      describe("literal keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
        });

        it("should not invoke callback for non-matching key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).not.toHaveBeenCalledTimes(1);
          expect(callback).not.toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "b",
          );
        });

        it("should invoke callback for case-insensitive key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("A", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
        });
      });

      describe("number keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("1", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("1", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");
        });

        it("should not invoke callback for non-matching key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("1", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "2");

          expect(callback).toHaveBeenCalledTimes(0);
          expect(callback).not.toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "1",
          );
        });
      });

      describe("special keys", () => {
        describe("Enter key", () => {
          it("should invoke callback on keyup event", () => {
            const callback = vi.fn();
            renderHook(() => useKey("Enter", callback, { eventType: "keyup" }));

            dispatchKeyboardEvent("keydown", "Enter");
            vi.advanceTimersByTime(100);
            dispatchKeyboardEvent("keyup", "Enter");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
              expect.any(KeyboardEvent),
              "Enter",
            );
          });

          it("should invoke callback on keydown event", () => {
            const callback = vi.fn();
            renderHook(() =>
              useKey("Enter", callback, { eventType: "keydown" }),
            );

            dispatchKeyboardEvent("keydown", "Enter");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
              expect.any(KeyboardEvent),
              "Enter",
            );
          });

          it("should invoke callback for case-insensitive key", () => {
            const callback = vi.fn();
            renderHook(() => useKey("enter", callback, { eventType: "keyup" }));

            dispatchKeyboardEvent("keydown", "Enter");
            vi.advanceTimersByTime(100);
            dispatchKeyboardEvent("keyup", "Enter");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
              expect.any(KeyboardEvent),
              "Enter",
            );
          });
        });

        describe("other special keys", () => {
          it("should invoke callback for ArrowUp key", () => {
            const callback = vi.fn();
            renderHook(() =>
              useKey("ArrowUp", callback, { eventType: "keyup" }),
            );

            dispatchKeyboardEvent("keydown", "ArrowUp");
            vi.advanceTimersByTime(100);
            dispatchKeyboardEvent("keyup", "ArrowUp");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
              expect.any(KeyboardEvent),
              "ArrowUp",
            );
          });

          it("should invoke callback for Escape key", () => {
            const callback = vi.fn();
            renderHook(() =>
              useKey("Escape", callback, { eventType: "keyup" }),
            );

            dispatchKeyboardEvent("keydown", "Escape");
            vi.advanceTimersByTime(100);
            dispatchKeyboardEvent("keyup", "Escape");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
              expect.any(KeyboardEvent),
              "Escape",
            );
          });

          it("should invoke callback for Delete key", () => {
            const callback = vi.fn();
            renderHook(() =>
              useKey("Delete", callback, { eventType: "keyup" }),
            );

            dispatchKeyboardEvent("keydown", "Delete");
            vi.advanceTimersByTime(100);
            dispatchKeyboardEvent("keyup", "Delete");

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
              expect.any(KeyboardEvent),
              "Delete",
            );
          });
        });
      });

      describe("function keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("F1", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("F1", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "F1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1",
          );
        });

        it("should invoke callback for case-insensitive key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("f1", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1",
          );
        });
      });

      describe("Any key", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("Any", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("Any", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );
        });

        it("should invoke callback for case-insensitive key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("any", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );
        });
      });

      describe("event object", () => {
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
    });

    describe("single combination string", () => {
      describe("literal keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a+b", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "a+b",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a+b", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "a+b",
          );
        });

        it.todo(
          "should not invoke callback on keyup event with additional key",
        );

        it("should not invoke callback on keyup event with long delay", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a+b", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");
          vi.advanceTimersByTime(500);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(0);
          expect(callback).not.toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "a+b",
          );
        });

        it("should not invoke callback on keyup event with wrong order", () => {
          const callback = vi.fn();
          renderHook(() => useKey("a+b", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");
          vi.advanceTimersByTime(200);
          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(0);
          expect(callback).not.toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "a+b",
          );
        });

        it("should invoke callback for case-insensitive key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("A+B", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "a+b",
          );
        });
      });

      describe("number keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("1+2", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "2");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "2");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "1+2",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("1+2", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "2");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "1+2",
          );
        });

        it("should not invoke callback for non-matching keys", () => {
          const callback = vi.fn();
          renderHook(() => useKey("1+2", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "3");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "3");

          expect(callback).toHaveBeenCalledTimes(0);
          expect(callback).not.toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "1+2",
          );
        });
      });

      describe("special keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey("Enter+ArrowUp", callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "ArrowUp");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "ArrowUp");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Enter+ArrowUp",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey("Enter+ArrowUp", callback, { eventType: "keydown" }),
          );

          dispatchKeyboardEvent("keydown", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "ArrowUp");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Enter+ArrowUp",
          );
        });

        it("should invoke callback for case-insensitive special key", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey("enter+arrowup", callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "ArrowUp");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "ArrowUp");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Enter+ArrowUp",
          );
        });
      });

      describe("function keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("F1+F2", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "F2");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F2");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1+F2",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("F1+F2", callback, { eventType: "keydown" }));

          dispatchKeyboardEvent("keydown", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "F2");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1+F2",
          );
        });

        it("should invoke callback for case-insensitive special key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("f1+f2", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "F2");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F2");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1+F2",
          );
        });
      });

      describe("Any keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() => useKey("Any+Any", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "ArrowUp");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "ArrowUp");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any+Any",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey("Any+Any", callback, { eventType: "keydown" }),
          );

          dispatchKeyboardEvent("keydown", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "ArrowUp");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any+Any",
          );
        });

        it("should invoke callback on keyup event with single Any key", () => {
          const callback = vi.fn();
          renderHook(() => useKey("Any+b", callback, { eventType: "keyup" }));

          dispatchKeyboardEvent("keydown", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "Enter");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any+b",
          );
        });
      });
    });

    describe("single sequence string", () => {
      it("should invoke callback on keyup event", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b c", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "c");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should invoke callback on keydown event", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b c", callback, { eventType: "keydown" }));

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

      it("should not invoke callback if sequence has no completion", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b c", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "c");

        expect(callback).toHaveBeenCalledTimes(0);
        expect(callback).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should not invoke callback if sequence has wrong order", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b c", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "c");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(0);
        expect(callback).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });

      it("should not invoke callback if sequence has long delay", () => {
        const callback = vi.fn();
        renderHook(() => useKey("a b c", callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(1500);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(1500);
        dispatchKeyboardEvent("keydown", "c");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).toHaveBeenCalledTimes(0);
        expect(callback).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c",
        );
      });
    });

    describe("complex code (sequence, combination and single string)", () => {
      it("should invoke callback for sequence with combination and single keys", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("ctrl+a b c", callback, { eventType: "keyup" }),
        );

        dispatchKeyboardEvent("keydown", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "c");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Control+a b c",
        );
      });
    });
  });

  describe("multiple patterns", () => {
    describe("array with single strings", () => {
      describe("literal keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["a", "b", "c"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");

          dispatchKeyboardEvent("keydown", "c");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "c");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "c");
        });

        it("should invoke callback on keyup event with ignored order", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["a", "b", "c"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

          dispatchKeyboardEvent("keydown", "c");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "c");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "c");
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["a", "b", "c"], callback, { eventType: "keydown" }),
          );

          dispatchKeyboardEvent("keydown", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

          dispatchKeyboardEvent("keydown", "b");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "b");

          dispatchKeyboardEvent("keydown", "c");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "c");
        });
      });

      describe("number keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["1", "2", "3"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keyup", "1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");

          dispatchKeyboardEvent("keyup", "2");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "2");

          dispatchKeyboardEvent("keyup", "3");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "3");
        });

        it("should invoke callback on keyup event with ignored order", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["1", "2", "3"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keyup", "2");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "2");

          dispatchKeyboardEvent("keyup", "1");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");

          dispatchKeyboardEvent("keyup", "3");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "3");
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["1", "2", "3"], callback, { eventType: "keydown" }),
          );

          dispatchKeyboardEvent("keydown", "1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "1");

          dispatchKeyboardEvent("keydown", "2");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "2");

          dispatchKeyboardEvent("keydown", "3");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "3");
        });
      });

      describe("special keys", () => {
        it("should invoke callback for array on keyup event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["Enter", "Escape", "Delete"], callback, {
              eventType: "keyup",
            }),
          );

          dispatchKeyboardEvent("keyup", "Enter");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Enter",
          );

          dispatchKeyboardEvent("keyup", "Escape");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Escape",
          );

          dispatchKeyboardEvent("keyup", "Delete");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Delete",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["Enter", "Escape", "Delete"], callback, {
              eventType: "keydown",
            }),
          );

          dispatchKeyboardEvent("keydown", "Enter");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Enter",
          );

          dispatchKeyboardEvent("keydown", "Escape");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Escape",
          );

          dispatchKeyboardEvent("keydown", "Delete");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Delete",
          );
        });
      });

      describe("function keys", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["F1", "F2", "F12"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "F1");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1",
          );

          dispatchKeyboardEvent("keydown", "F2");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F2");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F2",
          );

          dispatchKeyboardEvent("keydown", "F12");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "F12");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F12",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["F1", "F2", "F12"], callback, { eventType: "keydown" }),
          );

          dispatchKeyboardEvent("keydown", "F1");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F1",
          );

          dispatchKeyboardEvent("keydown", "F2");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F2",
          );

          dispatchKeyboardEvent("keydown", "F12");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "F12",
          );
        });
      });

      describe("Any key", () => {
        it("should invoke callback on keyup event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["A", "Any", "C"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );

          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );

          dispatchKeyboardEvent("keydown", "c");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "c");

          expect(callback).toHaveBeenCalledTimes(5);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "c");
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );
        });

        it("should invoke callback on keydown event", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["A", "Any", "C"], callback, { eventType: "keydown" }),
          );

          dispatchKeyboardEvent("keydown", "a");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );

          dispatchKeyboardEvent("keydown", "b");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );

          dispatchKeyboardEvent("keydown", "c");

          expect(callback).toHaveBeenCalledTimes(5);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "c");
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );
        });

        it("should invoke callback for case-insensitive key", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["A", "ANY", "C"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keydown", "a");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(2);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );

          dispatchKeyboardEvent("keydown", "b");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "b");

          expect(callback).toHaveBeenCalledTimes(3);
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );

          dispatchKeyboardEvent("keydown", "c");
          vi.advanceTimersByTime(100);
          dispatchKeyboardEvent("keyup", "c");

          expect(callback).toHaveBeenCalledTimes(5);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "c");
          expect(callback).toHaveBeenCalledWith(
            expect.any(KeyboardEvent),
            "Any",
          );
        });
      });

      describe("event object", () => {
        it("should pass event object to callback", () => {
          const callback = vi.fn();
          renderHook(() =>
            useKey(["a", "b", "c"], callback, { eventType: "keyup" }),
          );

          dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
        });

        it("should allow preventDefault on callback", () => {
          const callback = vi.fn((event) => {
            event.preventDefault();
          });

          renderHook(() =>
            useKey(["a", "b", "c"], callback, { eventType: "keyup" }),
          );

          const event = dispatchKeyboardEvent("keyup", "a");

          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
          expect(event.defaultPrevented).toBe(true);
        });
      });
    });

    describe("array with single combination strings", () => {
      it("should invoke callback on keyup event", () => {
        const callback = vi.fn();
        renderHook(() => useKey(["a+b"], callback, { eventType: "keyup" }));

        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a+b");
      });

      it("should invoke callback on keydown event", () => {
        const callback = vi.fn();
        renderHook(() => useKey(["a+b"], callback, { eventType: "keydown" }));

        dispatchKeyboardEvent("keydown", "a");
        dispatchKeyboardEvent("keydown", "b");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a+b");
      });
    });

    describe("array with single sequence string", () => {
      it("should invoke multiple sequential key schema", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey(["a b", "x y z"], callback, {
            eventType: "keyup",
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a b");

        dispatchKeyboardEvent("keyup", "x");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "y");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "z");

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "x y z",
        );
      });

      it("should invoke long sequential key schema in array", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey(["a b c d e", "x y"], callback, {
            eventType: "keyup",
            sequenceThreshold: 1000,
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "d");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "e");
        vi.advanceTimersByTime(100);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a b c d e",
        );

        dispatchKeyboardEvent("keyup", "x");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "y");

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "x y");
      });
    });

    describe("array with complex code (sequence, combination and single string)", () => {
      it("should invoke callback for array with combination schema", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey(["ctrl+a b c"], callback, { eventType: "keyup" }),
        );

        dispatchKeyboardEvent("keydown", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "c");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Control+a b c",
        );
      });
    });
  });

  describe("hook options", () => {
    describe("eventRepeat option", () => {
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
        expect(callback).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a",
        );
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
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
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

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("a", callback, { eventType: "keyup", eventOnce: false }),
        );

        dispatchKeyboardEvent("keyup", "a");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");

        dispatchKeyboardEvent("keyup", "a");

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
      });
    });

    describe("eventCapture option", () => {
      it("should respect eventCapture option - true", () => {
        const callback = vi.fn();

        renderHook(() =>
          useKey("a", callback, { eventType: "keyup", eventCapture: true }),
        );

        dispatchKeyboardEvent("keyup", "a");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
      });

      it("should respect eventCapture option - false", () => {
        const callback = vi.fn();

        renderHook(() =>
          useKey("a", callback, { eventType: "keyup", eventCapture: false }),
        );

        dispatchKeyboardEvent("keyup", "a");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        renderHook(() =>
          useKey("a", callback1, {
            eventType: "keyup",
            eventStopImmediatePropagation: true,
          }),
        );

        renderHook(() =>
          useKey("a", callback2, {
            eventType: "keyup",
          }),
        );

        dispatchKeyboardEvent("keyup", "a");

        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback1).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
        expect(callback2).not.toHaveBeenCalledTimes(1);
        expect(callback2).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "a",
        );
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        renderHook(() =>
          useKey("a", callback1, {
            eventType: "keyup",
            eventStopImmediatePropagation: false,
          }),
        );

        renderHook(() =>
          useKey("a", callback2, {
            eventType: "keyup",
          }),
        );

        dispatchKeyboardEvent("keyup", "a");

        expect(callback1).toHaveBeenCalledTimes(1);
        expect(callback1).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
        expect(callback2).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledWith(expect.any(KeyboardEvent), "a");
      });
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
        vi.advanceTimersByTime(500);
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
        dispatchKeyboardEvent("keyup", "x");
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

      it("should handle multiple sequence pattern with different thresholds", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey(["a b", "x y z"], callback, {
            eventType: "keyup",
            sequenceThreshold: 400,
          }),
        );

        dispatchKeyboardEvent("keyup", "a");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "b");

        expect(callback).toHaveBeenCalledTimes(1);

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
        vi.advanceTimersByTime(1500);
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

    describe("combinationThreshold option", () => {
      it("should invoke callback when combination keys are pressed within threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("ctrl+shift+a", callback, {
            eventType: "keyup",
            combinationThreshold: 400,
          }),
        );

        dispatchKeyboardEvent("keydown", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "Shift");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);

        dispatchKeyboardEvent("keyup", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "Shift");
        vi.advanceTimersByTime(300);
        dispatchKeyboardEvent("keyup", "a");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Control+Shift+a",
        );
      });

      it("should not invoke callback if combination keys are pressed with long delay", () => {
        const callback = vi.fn();
        renderHook(() =>
          useKey("ctrl+shift+a", callback, {
            eventType: "keyup",
            combinationThreshold: 300,
          }),
        );

        dispatchKeyboardEvent("keydown", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "Shift");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keydown", "a");
        vi.advanceTimersByTime(100);

        dispatchKeyboardEvent("keyup", "Control");
        vi.advanceTimersByTime(100);
        dispatchKeyboardEvent("keyup", "Shift");
        vi.advanceTimersByTime(400);
        dispatchKeyboardEvent("keyup", "a");

        expect(callback).not.toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalledWith(
          expect.any(KeyboardEvent),
          "Control+Shift+a",
        );
      });
    });

    describe("container option", () => {
      it("should attach listener to custom container", () => {
        const callback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() => useKey("a", callback, { container }));

        dispatchKeyboardEvent("keyup", "a", container.current);

        expect(callback).toHaveBeenCalledTimes(1);
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
