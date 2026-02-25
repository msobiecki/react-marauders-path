import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import usePinch from "./use-pinch";

const dispatchPointerEvent = (
  type: string,
  pointerId: number,
  clientX: number,
  clientY: number,
  target: EventTarget = globalThis,
  options: Partial<PointerEventInit> = {},
) => {
  const event = new PointerEvent(type, {
    pointerId,
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
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("usePinch hook", () => {
  describe("basic pinch handling", () => {
    it("should invoke callback on pointer move after two pointer downs", () => {
      const callback = vi.fn();
      renderHook(() => usePinch(callback));

      dispatchPointerEvent("pointerdown", 1, 0, 0);
      dispatchPointerEvent("pointerdown", 2, 100, 0);
      dispatchPointerEvent("pointermove", 2, 120, 0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(PointerEvent),
        expect.objectContaining({
          distance: 120,
          delta: 20,
          totalDelta: 20,
          scale: 1.2,
        }),
      );
    });

    it("should invoke callback on subsequent pointer moves", () => {
      const callback = vi.fn();
      renderHook(() => usePinch(callback));

      dispatchPointerEvent("pointerdown", 1, 0, 0);
      dispatchPointerEvent("pointerdown", 2, 100, 0);
      dispatchPointerEvent("pointermove", 2, 120, 0);
      dispatchPointerEvent("pointermove", 2, 140, 0);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback.mock.lastCall?.[1]).toEqual(
        expect.objectContaining({
          distance: 140,
          delta: 20,
          totalDelta: 40,
          scale: 1.4,
        }),
      );
    });

    it("should ignore pointer move without active pinch", () => {
      const callback = vi.fn();
      renderHook(() => usePinch(callback));

      dispatchPointerEvent("pointerdown", 1, 0, 0);
      dispatchPointerEvent("pointermove", 1, 20, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should stop pinching after pointer up", () => {
      const callback = vi.fn();
      renderHook(() => usePinch(callback));

      dispatchPointerEvent("pointerdown", 1, 0, 0);
      dispatchPointerEvent("pointerdown", 2, 100, 0);
      dispatchPointerEvent("pointermove", 2, 120, 0);
      dispatchPointerEvent("pointerup", 2, 120, 0);
      dispatchPointerEvent("pointermove", 1, 10, 0);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should stop pinching after pointer cancel", () => {
      const callback = vi.fn();
      renderHook(() => usePinch(callback));

      dispatchPointerEvent("pointerdown", 1, 0, 0);
      dispatchPointerEvent("pointerdown", 2, 100, 0);
      dispatchPointerEvent("pointermove", 2, 120, 0);
      dispatchPointerEvent("pointercancel", 2, 120, 0);
      dispatchPointerEvent("pointermove", 1, 10, 0);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("hook options", () => {
    describe("threshold option", () => {
      it("should ignore movement below threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePinch(callback, {
            threshold: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 140, 0);

        expect(callback).not.toHaveBeenCalled();
      });

      it("should invoke callback when movement reaches threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePinch(callback, {
            threshold: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 150, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventPointerTypes option", () => {
      it("should ignore pointer types not included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePinch(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0, globalThis, {
          pointerType: "touch",
        });
        dispatchPointerEvent("pointerdown", 2, 100, 0, globalThis, {
          pointerType: "touch",
        });
        dispatchPointerEvent("pointermove", 2, 130, 0, globalThis, {
          pointerType: "touch",
        });

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle pointer types included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePinch(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0, globalThis, {
          pointerType: "mouse",
        });
        dispatchPointerEvent("pointerdown", 2, 100, 0, globalThis, {
          pointerType: "mouse",
        });
        dispatchPointerEvent("pointermove", 2, 130, 0, globalThis, {
          pointerType: "mouse",
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          usePinch(vi.fn(), {
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
          usePinch(vi.fn(), {
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
          usePinch(callback, {
            eventOnce: true,
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 120, 0);

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 140, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePinch(callback, {
            eventOnce: false,
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 120, 0);
        dispatchPointerEvent("pointerup", 2, 120, 0);

        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 140, 0);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const { unmount } = renderHook(() =>
          usePinch(callback, {
            eventStopImmediatePropagation: true,
          }),
        );

        globalThis.addEventListener("pointermove", otherCallback);

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        const moveEvent = dispatchPointerEvent("pointermove", 2, 140, 0);

        expect(moveEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).not.toHaveBeenCalled();

        unmount();
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const { unmount } = renderHook(() =>
          usePinch(callback, {
            eventStopImmediatePropagation: false,
          }),
        );

        globalThis.addEventListener("pointermove", otherCallback);

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        const moveEvent = dispatchPointerEvent("pointermove", 2, 140, 0);

        expect(moveEvent.stopImmediatePropagation).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);

        unmount();
      });
    });

    describe("container option", () => {
      it("should attach listeners to custom container", () => {
        const callback = vi.fn();
        const container = {
          current: document.createElement("div"),
        };

        renderHook(() =>
          usePinch(callback, {
            container,
          }),
        );

        dispatchPointerEvent("pointerdown", 1, 0, 0, container.current);
        dispatchPointerEvent("pointerdown", 2, 100, 0, container.current);
        dispatchPointerEvent("pointermove", 2, 120, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("raf option", () => {
      it("should invoke callback on animation frame when raf is true", () => {
        const callback = vi.fn();
        renderHook(() => usePinch(callback, { raf: true }));

        dispatchPointerEvent("pointerdown", 1, 0, 0);
        dispatchPointerEvent("pointerdown", 2, 100, 0);
        dispatchPointerEvent("pointermove", 2, 120, 0);
        dispatchPointerEvent("pointermove", 2, 140, 0);

        expect(callback).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(20);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.lastCall?.[1]).toEqual(
          expect.objectContaining({
            distance: 140,
            totalDelta: 40,
          }),
        );
      });
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => usePinch(callback));

      unmount();

      dispatchPointerEvent("pointerdown", 1, 0, 0);
      dispatchPointerEvent("pointerdown", 2, 100, 0);
      dispatchPointerEvent("pointermove", 2, 140, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
