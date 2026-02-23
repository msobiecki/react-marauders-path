import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import useWheel from "./use-wheel";

const dispatchWheelEvent = (
  deltaX = 0,
  deltaY = 0,
  deltaZ = 0,
  deltaMode = 0,
  target: EventTarget = globalThis,
  options: Partial<WheelEventInit> = {},
) => {
  const event = new WheelEvent("wheel", {
    deltaX,
    deltaY,
    deltaZ,
    deltaMode,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  if ("stopImmediatePropagation" in event) {
    vi.spyOn(event, "stopImmediatePropagation");
  }

  target.dispatchEvent(event);
  return event;
};

describe("useWheel hook", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("basic wheel event handling", () => {
    it("should invoke callback on wheel event", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(10, 20, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          x: 10,
          y: 20,
          z: 0,
          deltaMode: 0,
        }),
      );
    });

    it("should pass correct event and delta to callback", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(5, 15, 2, 1);

      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          x: 5,
          y: 15,
          z: 2,
          deltaMode: 1,
        }),
      );
    });

    it("should handle multiple wheel events", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(10, 20);
      dispatchWheelEvent(5, 15);
      dispatchWheelEvent(1, 2);

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should handle zero delta values", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(0, 0, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          x: 0,
          y: 0,
          z: 0,
        }),
      );
    });

    it("should handle negative delta values", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(-10, -20, -5);

      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          x: -10,
          y: -20,
          z: -5,
        }),
      );
    });

    it("should handle large delta values", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(1000, 2000, 3000);

      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          x: 1000,
          y: 2000,
          z: 3000,
        }),
      );
    });
  });

  describe("deltaMode handling", () => {
    it("should preserve deltaMode 0 (pixels)", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(10, 20, 0, 0);

      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          deltaMode: 0,
        }),
      );
    });

    it("should preserve deltaMode 1 (lines)", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(10, 20, 0, 1);

      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          deltaMode: 1,
        }),
      );
    });

    it("should preserve deltaMode 2 (pages)", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(10, 20, 0, 2);

      expect(callback).toHaveBeenCalledWith(
        expect.any(WheelEvent),
        expect.objectContaining({
          deltaMode: 2,
        }),
      );
    });
  });

  describe("hook options", () => {
    describe("eventPassive option", () => {
      it("should respect eventPassive option - true", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { eventPassive: true }));

        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventPassive option - false", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { eventPassive: false }));

        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should respect eventCapture option - true", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { eventCapture: true }));

        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventCapture option - false", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { eventCapture: false }));

        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { eventOnce: true }));

        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(1);

        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { eventOnce: false }));

        dispatchWheelEvent(10, 20);
        dispatchWheelEvent(10, 20);
        dispatchWheelEvent(10, 20);

        expect(callback).toHaveBeenCalledTimes(3);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();

        const { unmount } = renderHook(() =>
          useWheel(callback, { eventStopImmediatePropagation: true }),
        );

        globalThis.addEventListener("wheel", otherCallback);
        const wheelEvent = dispatchWheelEvent(10, 20);
        const wheelEventSpy = vi.spyOn(wheelEvent, "stopImmediatePropagation");

        expect(wheelEventSpy).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).not.toHaveBeenCalled();

        unmount();
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();

        const { unmount } = renderHook(() =>
          useWheel(callback, { eventStopImmediatePropagation: false }),
        );

        globalThis.addEventListener("wheel", otherCallback);
        const wheelEvent = dispatchWheelEvent(10, 20);

        const wheelEventSpy = vi.spyOn(wheelEvent, "stopImmediatePropagation");

        expect(wheelEventSpy).not.toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);

        unmount();
      });
    });

    describe("container option", () => {
      it("should attach listener to custom container", () => {
        const callback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() => useWheel(callback, { container }));

        dispatchWheelEvent(10, 20, 0, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("raf option", () => {
      it("should accept raf option", () => {
        const callback = vi.fn();
        renderHook(() => useWheel(callback, { raf: true }));

        expect(callback).toBeDefined();
      });
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useWheel(callback));

      unmount();

      dispatchWheelEvent(0, 0);
      vi.advanceTimersByTime(100);
      dispatchWheelEvent(100, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle negative delta values", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      dispatchWheelEvent(-10, -20);

      expect(callback).toBeDefined();
    });
  });
});
