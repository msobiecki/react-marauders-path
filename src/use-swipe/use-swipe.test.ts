import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import useSwipe from "./use-swipe";
import { SwipeDirections } from "./use-swipe.types";

const dispatchTouchEvent = (
  type: string,
  x: number,
  y: number,
  target: EventTarget = globalThis,
  touches: { clientX: number; clientY: number }[] = [
    { clientX: x, clientY: y },
  ],
) => {
  let event: Event;

  if (typeof TouchEvent === "undefined") {
    event = new Event(type, { bubbles: true, cancelable: true });
  } else {
    event = new TouchEvent(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, "changedTouches", {
      value: touches,
    });
  }

  if ("stopImmediatePropagation" in event) {
    vi.spyOn(event, "stopImmediatePropagation");
  }

  target.dispatchEvent(event);
  return event;
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useSwipe hook", () => {
  describe("basic swipe handling", () => {
    it("should invoke callback for right swipe above threshold and velocity", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchTouchEvent("touchstart", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchTouchEvent("touchend", 100, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(Event),
        expect.objectContaining({
          direction: SwipeDirections.Right,
          deltaX: 100,
          deltaY: 0,
        }),
      );
    });

    it("should ignore swipe below threshold", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchTouchEvent("touchstart", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchTouchEvent("touchend", 20, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore swipe below velocity requirement", () => {
      const callback = vi.fn();
      renderHook(() =>
        useSwipe(SwipeDirections.Right, callback, {
          velocity: 2,
          threshold: 10,
        }),
      );

      dispatchTouchEvent("touchstart", 0, 0);
      vi.advanceTimersByTime(1000);
      dispatchTouchEvent("touchend", 20, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle zero-duration swipe safely", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchTouchEvent("touchstart", 0, 0);
      dispatchTouchEvent("touchend", 100, 0);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should ignore multi-touch events", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchTouchEvent("touchstart", 0, 0, globalThis, [
        { clientX: 0, clientY: 0 },
        { clientX: 50, clientY: 0 },
      ]);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("schema handling", () => {
    it("should respect multiple allowed directions", () => {
      const callback = vi.fn();
      renderHook(() =>
        useSwipe([SwipeDirections.Left, SwipeDirections.Right], callback),
      );

      dispatchTouchEvent("touchstart", 50, 0);
      vi.advanceTimersByTime(100);
      dispatchTouchEvent("touchend", -50, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.lastCall?.[1].direction).toBe(SwipeDirections.Left);
    });

    it("should reject swipe not matching schema", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Horizontal, callback));

      dispatchTouchEvent("touchstart", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchTouchEvent("touchend", 0, 100);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("hook options", () => {
    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useSwipe(SwipeDirections.Right, vi.fn(), {
            eventCapture: true,
          }),
        );

        expect(spy).toHaveBeenCalledWith(
          "touchstart",
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );

        expect(spy).toHaveBeenCalledWith(
          "touchend",
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );
      });

      it("should attach listeners with capture when false", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useSwipe(SwipeDirections.Right, vi.fn(), {
            eventCapture: false,
          }),
        );

        expect(spy).toHaveBeenCalledWith(
          "touchstart",
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );

        expect(spy).toHaveBeenCalledWith(
          "touchend",
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );
      });
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
        const callback = vi.fn();
        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventOnce: true,
          }),
        );

        dispatchTouchEvent("touchstart", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchTouchEvent("touchend", 100, 0);

        dispatchTouchEvent("touchstart", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchTouchEvent("touchend", 100, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventOnce: false,
          }),
        );

        dispatchTouchEvent("touchstart", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchTouchEvent("touchend", 100, 0);

        dispatchTouchEvent("touchstart", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchTouchEvent("touchend", 100, 0);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventStopImmediatePropagation: true,
          }),
        );

        dispatchTouchEvent("touchstart", 0, 0);
        vi.advanceTimersByTime(50);
        const endEvent = dispatchTouchEvent("touchend", 80, 0);
        const stopSpy = vi.spyOn(endEvent, "stopImmediatePropagation");

        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventStopImmediatePropagation: false,
          }),
        );

        dispatchTouchEvent("touchstart", 0, 0);
        vi.advanceTimersByTime(50);
        const endEvent = dispatchTouchEvent("touchend", 80, 0);
        const stopSpy = vi.spyOn(endEvent, "stopImmediatePropagation");

        expect(stopSpy).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("container option", () => {
      it("should attach listener to custom container", () => {
        const callback = vi.fn();
        const container = {
          current: document.createElement("div"),
        };

        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            container,
          }),
        );

        dispatchTouchEvent("touchstart", 0, 0, container.current);

        vi.advanceTimersByTime(100);

        dispatchTouchEvent("touchend", 100, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() =>
        useSwipe(SwipeDirections.Right, callback),
      );

      unmount();

      dispatchTouchEvent("touchstart", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchTouchEvent("touchend", 100, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
