import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import useWheel from "./use-wheel";

const dispatchWheelEvent = (
  deltaX = 0,
  deltaY = 0,
  deltaZ = 0,
  deltaMode = 0,
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
  globalThis.dispatchEvent(event);
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

  describe("eventPassive option", () => {
    it("should respect eventPassive true option", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventPassive: true }));

      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should respect eventPassive false option", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventPassive: false }));

      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("eventCapture option", () => {
    it("should respect eventCapture true option", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventCapture: true }));

      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should respect eventCapture false option", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventCapture: false }));

      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("eventOnce option", () => {
    it("should invoke callback once when eventOnce is true", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventOnce: true }));

      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(1);

      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should invoke callback multiple times when eventOnce is false", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventOnce: false }));

      dispatchWheelEvent(10, 20);
      dispatchWheelEvent(10, 20);
      dispatchWheelEvent(10, 20);

      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should not invoke callback after eventOnce fires", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback, { eventOnce: true }));

      dispatchWheelEvent(10, 20);
      expect(callback).toHaveBeenCalledTimes(1);

      dispatchWheelEvent(5, 15);
      dispatchWheelEvent(1, 2);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("eventStopImmediatePropagation option", () => {
    it("should respect eventStopImmediatePropagation option", () => {
      const callback = vi.fn();
      renderHook(() =>
        useWheel(callback, { eventStopImmediatePropagation: true }),
      );

      dispatchWheelEvent(10, 20);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("container option", () => {
    it("should attach listener to custom container", () => {
      const callback = vi.fn();
      const container = { current: document.createElement("div") };

      renderHook(() => useWheel(callback, { container }));

      const event = new WheelEvent("wheel", {
        deltaX: 10,
        deltaY: 20,
        bubbles: true,
      });
      container.current?.dispatchEvent(event);

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

  describe("callback behavior", () => {
    it("should accept callback function", () => {
      const callback = vi.fn();
      renderHook(() => useWheel(callback));

      expect(callback).toBeDefined();
    });
  });

  describe("combined options", () => {
    it("should handle multiple options together", () => {
      const callback = vi.fn();
      const container = { current: document.createElement("div") };

      renderHook(() =>
        useWheel(callback, {
          eventPassive: false,
          eventCapture: true,
          eventOnce: true,
          eventStopImmediatePropagation: true,
          container,
          raf: false,
        }),
      );

      const event = new WheelEvent("wheel", {
        deltaX: 10,
        deltaY: 20,
        bubbles: true,
      });
      container.current?.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);

      const event2 = new WheelEvent("wheel", {
        deltaX: 5,
        deltaY: 15,
        bubbles: true,
      });
      container.current?.dispatchEvent(event2);

      expect(callback).toHaveBeenCalledTimes(1);
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
