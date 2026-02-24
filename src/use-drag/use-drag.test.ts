import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

import useDrag from "./use-drag";

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
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useDrag hook", () => {
  describe("basic drag handling", () => {
    it("should invoke callback on pointer move after pointer down", () => {
      const callback = vi.fn();
      renderHook(() => useDrag(callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointermove", 100, 40);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(Event),
        expect.objectContaining({
          deltaX: 100,
          deltaY: 40,
          movementX: 100,
          movementY: 40,
          startX: 0,
          startY: 0,
          endX: 100,
          endY: 40,
        }),
      );
    });

    it("should invoke callback on subsequent pointer moves", () => {
      const callback = vi.fn();
      renderHook(() => useDrag(callback));

      dispatchPointerEvent("pointerdown", 10, 10);
      vi.advanceTimersByTime(20);
      dispatchPointerEvent("pointermove", 20, 25);
      vi.advanceTimersByTime(20);
      dispatchPointerEvent("pointermove", 35, 40);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback.mock.lastCall?.[1]).toEqual(
        expect.objectContaining({
          deltaX: 25,
          deltaY: 30,
          movementX: 15,
          movementY: 15,
          startX: 10,
          startY: 10,
          endX: 35,
          endY: 40,
        }),
      );
    });

    it("should ignore pointer move without active drag", () => {
      const callback = vi.fn();
      renderHook(() => useDrag(callback));

      dispatchPointerEvent("pointermove", 100, 0);

      expect(callback).not.toHaveBeenCalled();
    });

    it("should stop dragging after pointer up", () => {
      const callback = vi.fn();
      renderHook(() => useDrag(callback));

      dispatchPointerEvent("pointerdown", 0, 0);
      dispatchPointerEvent("pointermove", 10, 0);
      dispatchPointerEvent("pointerup", 10, 0);
      dispatchPointerEvent("pointermove", 20, 0);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("hook options", () => {
    describe("threshold option", () => {
      it("should ignore movement below threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDrag(callback, {
            threshold: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        dispatchPointerEvent("pointermove", 20, 0);

        expect(callback).not.toHaveBeenCalled();
      });

      it("should invoke callback when movement reaches threshold", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDrag(callback, {
            threshold: 50,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        dispatchPointerEvent("pointermove", 50, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventPointerTypes option", () => {
      it("should ignore pointer types not included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDrag(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
          pointerType: "touch",
        });
        dispatchPointerEvent("pointermove", 60, 0, globalThis, {
          pointerType: "touch",
        });

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle pointer types included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDrag(callback, {
            eventPointerTypes: ["mouse"],
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
          pointerType: "mouse",
        });
        dispatchPointerEvent("pointermove", 60, 0, globalThis, {
          pointerType: "mouse",
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useDrag(vi.fn(), {
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
      });

      it("should attach listeners with capture when false", () => {
        const spy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useDrag(vi.fn(), {
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
      });
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDrag(callback, {
            eventOnce: true,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        dispatchPointerEvent("pointermove", 60, 0);

        dispatchPointerEvent("pointerdown", 0, 0);
        dispatchPointerEvent("pointermove", 120, 0);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useDrag(callback, {
            eventOnce: false,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0);
        dispatchPointerEvent("pointermove", 60, 0);

        dispatchPointerEvent("pointerup", 60, 0);

        dispatchPointerEvent("pointerdown", 0, 0);
        dispatchPointerEvent("pointermove", 120, 0);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should respect eventStopImmediatePropagation option - true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const { unmount } = renderHook(() =>
          useDrag(callback, {
            eventStopImmediatePropagation: true,
          }),
        );

        globalThis.addEventListener("pointermove", otherCallback);

        dispatchPointerEvent("pointerdown", 0, 0);
        const moveEvent = dispatchPointerEvent("pointermove", 80, 0);

        expect(moveEvent.stopImmediatePropagation).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).not.toHaveBeenCalled();

        unmount();
      });

      it("should respect eventStopImmediatePropagation option - false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const { unmount } = renderHook(() =>
          useDrag(callback, {
            eventStopImmediatePropagation: false,
          }),
        );

        globalThis.addEventListener("pointermove", otherCallback);

        dispatchPointerEvent("pointerdown", 0, 0);
        const moveEvent = dispatchPointerEvent("pointermove", 80, 0);

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
          useDrag(callback, {
            container,
          }),
        );

        dispatchPointerEvent("pointerdown", 0, 0, container.current);
        dispatchPointerEvent("pointermove", 100, 0, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("raf option", () => {
      it("should accept raf option", () => {
        const callback = vi.fn();
        renderHook(() => useDrag(callback, { raf: true }));

        expect(callback).toBeDefined();
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() => useDrag(callback));

      dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
        isPrimary: false,
      });
      dispatchPointerEvent("pointermove", 100, 0, globalThis, {
        isPrimary: false,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("lifecycle", () => {
    it("should cleanup listeners on unmount", () => {
      const callback = vi.fn();
      const { unmount } = renderHook(() => useDrag(callback));

      unmount();

      dispatchPointerEvent("pointerdown", 0, 0);
      dispatchPointerEvent("pointermove", 100, 0);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
