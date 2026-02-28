import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

import useTap from "./use-tap";

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

describe("useTap hook", () => {
  describe("basic tap handling", () => {
    it("should invoke callback for a quick tap within threshold", () => {
      const callback = vi.fn();
      renderHook(() => useTap(callback));

      dispatchPointerEvent("pointerdown", 10, 20);
      vi.advanceTimersByTime(100);
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

    it("should ignore tap when movement exceeds threshold", () => {
      const callback = vi.fn();
      renderHook(() => useTap(callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 20, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore tap when duration exceeds maxDuration", () => {
      const callback = vi.fn();
      renderHook(() => useTap(callback, { maxDuration: 250 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(300);
      dispatchPointerEvent("pointerup", 1, 1);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore pointer up without active tap", () => {
      const callback = vi.fn();
      renderHook(() => useTap(callback));

      dispatchPointerEvent("pointerup", 0, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel active tap on pointer cancel", () => {
      const callback = vi.fn();
      renderHook(() => useTap(callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      dispatchPointerEvent("pointercancel", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 0, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("hook options", () => {
    describe("eventPointerTypes option", () => {
      it("should ignore pointer types not included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          useTap(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
          pointerType: "touch",
        });
        vi.advanceTimersByTime(50);
        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          pointerType: "touch",
        });

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle pointer types included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          useTap(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
          pointerType: "mouse",
        });
        vi.advanceTimersByTime(50);
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
          useTap(vi.fn(), {
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

        expect(spy).toHaveBeenCalledWith(
          "pointercancel",
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );
      });

      it("should attach listeners with capture when false", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useTap(vi.fn(), {
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

        expect(spy).toHaveBeenCalledWith(
          "pointercancel",
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );
      });
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
        const callback = vi.fn();
        renderHook(() =>
          useTap(callback, {
            eventOnce: true,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);
        dispatchPointerEvent("pointerup", 0, 0);

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);
        dispatchPointerEvent("pointerup", 0, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useTap(callback, {
            eventOnce: false,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);
        dispatchPointerEvent("pointerup", 0, 0);

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);
        dispatchPointerEvent("pointerup", 0, 0);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useTap(callback, {
            eventStopImmediatePropagation: true,
            container,
          }),
        );

        container.current.addEventListener("pointerup", otherCallback);

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        const endEvent = dispatchPointerEvent(
          "pointerup",
          0,
          0,
          container.current,
        );

        expect(endEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).not.toHaveBeenCalled();

        container.current.removeEventListener("pointerup", otherCallback);
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useTap(callback, {
            eventStopImmediatePropagation: false,
            container,
          }),
        );

        container.current.addEventListener("pointerup", otherCallback);

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        const endEvent = dispatchPointerEvent(
          "pointerup",
          0,
          0,
          container.current,
        );

        expect(endEvent.stopImmediatePropagation).not.toHaveBeenCalled();
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
          useTap(callback, {
            container,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        vi.advanceTimersByTime(50);
        dispatchPointerEvent("pointerup", 0, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() => useTap(callback));

      dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
        isPrimary: false,
      });
      vi.advanceTimersByTime(50);
      dispatchPointerEvent("pointerup", 0, 0, globalThis, {
        isPrimary: false,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useTap(callback));

      unmount();

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(50);
      dispatchPointerEvent("pointerup", 0, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
