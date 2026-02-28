import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

import usePress from "./use-press";

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

describe("usePress hook", () => {
  describe("basic press handling", () => {
    it("should invoke callback after delay", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 200 }));

      dispatchPointerEvent("pointerdown", 10, 20);
      vi.advanceTimersByTime(200);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(PointerEvent),
        expect.objectContaining({
          x: 10,
          y: 20,
        }),
      );
    });

    it("should not invoke callback before delay", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 200 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(199);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel press on pointer up before delay", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 200 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup", 0, 0);
      vi.advanceTimersByTime(200);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel press on pointer cancel before delay", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 200 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointercancel", 0, 0);
      vi.advanceTimersByTime(200);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should cancel press when movement exceeds threshold", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 200, threshold: 8 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointermove", 20, 0);
      vi.advanceTimersByTime(200);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should keep press active when movement stays within threshold", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 200, threshold: 8 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointermove", 5, 3);
      vi.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("hook options", () => {
    describe("eventPointerTypes option", () => {
      it("should ignore pointer types not included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePress(callback, {
            eventPointerTypes: ["mouse"],
            delay: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
          pointerType: "touch",
        });
        vi.advanceTimersByTime(50);

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle pointer types included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePress(callback, {
            eventPointerTypes: ["mouse"],
            delay: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
          pointerType: "mouse",
        });
        vi.advanceTimersByTime(50);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          usePress(vi.fn(), {
            eventCapture: true,
          }),
        );

        expect(spy).toHaveBeenCalledWith(
          "pointerdown",
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );

        expect(spy).toHaveBeenCalledWith(
          "pointermove",
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
          usePress(vi.fn(), {
            eventCapture: false,
          }),
        );

        expect(spy).toHaveBeenCalledWith(
          "pointerdown",
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );

        expect(spy).toHaveBeenCalledWith(
          "pointermove",
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
          usePress(callback, {
            eventOnce: true,
            delay: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePress(callback, {
            eventOnce: false,
            delay: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);

        dispatchPointerEvent("pointerdown", 0, 0);
        vi.advanceTimersByTime(50);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          usePress(callback, {
            eventStopImmediatePropagation: true,
            delay: 50,
            container,
          }),
        );

        container.current.addEventListener("pointerdown", otherCallback);

        const event = dispatchPointerEvent(
          "pointerdown",
          0,
          0,
          container.current,
        );
        vi.advanceTimersByTime(50);

        expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);

        container.current.removeEventListener("pointerdown", otherCallback);
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          usePress(callback, {
            eventStopImmediatePropagation: false,
            delay: 50,
            container,
          }),
        );

        container.current.addEventListener("pointerdown", otherCallback);

        const event = dispatchPointerEvent(
          "pointerdown",
          0,
          0,
          container.current,
        );
        vi.advanceTimersByTime(50);

        expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);

        container.current.removeEventListener("pointerdown", otherCallback);
      });
    });

    describe("container option", () => {
      it("should attach listener to custom container", () => {
        const callback = vi.fn();
        const container = {
          current: document.createElement("div"),
        };

        renderHook(() =>
          usePress(callback, {
            container,
            delay: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        vi.advanceTimersByTime(50);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() => usePress(callback, { delay: 50 }));

      dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
        isPrimary: false,
      });
      vi.advanceTimersByTime(50);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners and timers on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => usePress(callback, { delay: 50 }));

      dispatchPointerEvent("pointerdown", 0, 0);
      unmount();
      vi.advanceTimersByTime(50);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
