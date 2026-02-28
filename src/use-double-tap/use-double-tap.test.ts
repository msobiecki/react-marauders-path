import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

import useDoubleTap from "./use-double-tap";

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

describe("useDoubleTap hook", () => {
  describe("basic double tap handling", () => {
    it("should invoke callback on two taps within delay and threshold", () => {
      const callback = vi.fn();
      renderHook(() => useDoubleTap(callback, { delay: 300, threshold: 8 }));

      dispatchPointerEvent("pointerup", 10, 20);
      vi.advanceTimersByTime(200);
      dispatchPointerEvent("pointerup", 14, 23);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(PointerEvent),
        expect.objectContaining({
          x: 14,
          y: 23,
        }),
      );
    });

    it("should ignore second tap when delay is exceeded", () => {
      const callback = vi.fn();
      renderHook(() => useDoubleTap(callback, { delay: 300 }));

      dispatchPointerEvent("pointerup", 0, 0);
      vi.advanceTimersByTime(301);
      dispatchPointerEvent("pointerup", 0, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore second tap when distance exceeds threshold", () => {
      const callback = vi.fn();
      renderHook(() => useDoubleTap(callback, { threshold: 8 }));

      dispatchPointerEvent("pointerup", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 20, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should reset baseline tap after delay miss and allow next double tap", () => {
      const callback = vi.fn();
      renderHook(() => useDoubleTap(callback, { delay: 300 }));

      dispatchPointerEvent("pointerup", 0, 0);
      vi.advanceTimersByTime(301);
      dispatchPointerEvent("pointerup", 0, 0);

      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 0, 0);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("hook options", () => {
    describe("eventPointerTypes option", () => {
      it("should ignore pointer types not included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDoubleTap(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          pointerType: "touch",
        });
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          pointerType: "touch",
        });

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle pointer types included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDoubleTap(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          pointerType: "mouse",
        });
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          pointerType: "mouse",
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useDoubleTap(vi.fn(), {
            eventCapture: true,
          }),
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
          useDoubleTap(vi.fn(), {
            eventCapture: false,
          }),
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
          useDoubleTap(callback, {
            eventOnce: true,
          }),
        );

        dispatchPointerEvent("pointerup", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0);

        dispatchPointerEvent("pointerup", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDoubleTap(callback, {
            eventOnce: false,
          }),
        );

        dispatchPointerEvent("pointerup", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0);

        dispatchPointerEvent("pointerup", 0, 0);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = {
          current: document.createElement("div"),
        };

        renderHook(() =>
          useDoubleTap(callback, {
            eventStopImmediatePropagation: true,
            container,
          }),
        );

        container.current.addEventListener("pointerup", otherCallback);

        dispatchPointerEvent("pointerup", 0, 0, container.current);
        const secondEvent = dispatchPointerEvent(
          "pointerup",
          0,
          0,
          container.current,
        );

        expect(secondEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);

        container.current.removeEventListener("pointerup", otherCallback);
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = {
          current: document.createElement("div"),
        };

        renderHook(() =>
          useDoubleTap(callback, {
            eventStopImmediatePropagation: false,
            container,
          }),
        );

        container.current.addEventListener("pointerup", otherCallback);

        dispatchPointerEvent("pointerup", 0, 0, container.current);
        const secondEvent = dispatchPointerEvent(
          "pointerup",
          0,
          0,
          container.current,
        );

        expect(secondEvent.stopImmediatePropagation).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(2);

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
          useDoubleTap(callback, {
            container,
          }),
        );

        dispatchPointerEvent("pointerup", 0, 0, container.current);
        vi.advanceTimersByTime(100);
        dispatchPointerEvent("pointerup", 0, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() => useDoubleTap(callback));

      dispatchPointerEvent("pointerup", 0, 0, globalThis, {
        isPrimary: false,
      });
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 0, 0, globalThis, {
        isPrimary: false,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useDoubleTap(callback));

      unmount();

      dispatchPointerEvent("pointerup", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 0, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
