import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

import useSwipe from "./use-swipe";
import { SwipeDirections } from "./use-swipe.types";

const dispatchPointerEvent = (
  type: string,
  clientX: number,
  clientY: number,
  target: EventTarget = globalThis,
  options: Partial<PointerEventInit> = {},
) => {
  const event = new PointerEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
    isPrimary: true,
    pointerType: "touch",
    ...options,
  });

  if ("stopImmediatePropagation" in event) {
    vi.spyOn(event, "stopImmediatePropagation");
  }

  target.dispatchEvent(event);
  return event;
};

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("useSwipe hook", () => {
  describe("basic swipe handling", () => {
    it("should invoke callback for right swipe above threshold and velocity", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 100, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(Event),
        SwipeDirections.Right,
        expect.objectContaining({
          deltaX: 100,
          deltaY: 0,
        }),
      );
    });

    it("should ignore swipe below threshold", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 20, 0);

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

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(1000);
      dispatchPointerEvent("pointerup", 20, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore zero-duration swipe", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      dispatchPointerEvent("pointerup", 100, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore multi-touch events", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      dispatchPointerEvent("pointerdown", 50, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("schema handling", () => {
    it("should respect multiple allowed directions", () => {
      const callback = vi.fn();
      renderHook(() =>
        useSwipe([SwipeDirections.Left, SwipeDirections.Right], callback),
      );

      dispatchPointerEvent("pointerdown", 50, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", -50, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.lastCall?.[1]).toBe(SwipeDirections.Left);
    });

    it("should reject swipe not matching schema", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Horizontal, callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 0, 100);

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
          "pointerdown",
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );

        expect(spy).toHaveBeenCalledWith(
          "pointerup",
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
          "pointerdown",
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );

        expect(spy).toHaveBeenCalledWith(
          "pointerup",
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

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 100, 0);

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 100, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventOnce: false,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 100, 0);

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 100, 0);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventStopImmediatePropagation: true,
            container,
          }),
        );

        container.current.addEventListener("pointerup", otherCallback);

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        vi.advanceTimersByTime(50);
        const endEvent = dispatchPointerEvent(
          "pointerup",
          80,
          0,
          container.current,
        );
        const stopSpy = vi.spyOn(endEvent, "stopImmediatePropagation");

        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).not.toHaveBeenCalled();

        container.current.removeEventListener("pointerup", otherCallback);
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useSwipe(SwipeDirections.Right, callback, {
            eventStopImmediatePropagation: false,
            container,
          }),
        );

        container.current.addEventListener("pointerup", otherCallback);

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        vi.advanceTimersByTime(50);
        const endEvent = dispatchPointerEvent(
          "pointerup",
          80,
          0,
          container.current,
        );
        const stopSpy = vi.spyOn(endEvent, "stopImmediatePropagation");

        expect(stopSpy).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);

        container.current.removeEventListener("pointerup", otherCallback);
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

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 100, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() => useSwipe(SwipeDirections.Right, callback));

      dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
        isPrimary: false,
      });
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 100, 0, globalThis, {
        isPrimary: false,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() =>
        useSwipe(SwipeDirections.Right, callback),
      );

      unmount();

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 100, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
