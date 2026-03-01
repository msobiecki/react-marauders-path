import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

import useMouse from "./use-mouse";
import { MouseButtons, MouseEventTypes } from "./use-mouse.types";

const dispatchPointerEvent = (
  type: string,
  clientX = 10,
  clientY = 20,
  target: EventTarget = globalThis,
  options: Partial<PointerEventInit> = {},
) => {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: MouseButtons.Left,
    pointerType: "mouse",
    isPrimary: true,
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

describe("useMouse hook", () => {
  describe("basic mouse handling", () => {
    it("should invoke callback with translated event type and data", () => {
      const callback = vi.fn();
      renderHook(() => useMouse(callback));

      dispatchPointerEvent("pointerdown", 14, 23);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(PointerEvent),
        MouseEventTypes.Down,
        expect.objectContaining({ x: 14, y: 23, button: MouseButtons.Left }),
      );
    });

    it("should support click and dblclick translated from pointerup", () => {
      const callback = vi.fn();
      renderHook(() =>
        useMouse(callback, {
          eventType: [MouseEventTypes.Click, MouseEventTypes.DoubleClick],
        }),
      );

      dispatchPointerEvent("pointerup");
      vi.advanceTimersByTime(100);
      dispatchPointerEvent("pointerup");
      dispatchPointerEvent("pointerdown");

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(
        1,
        expect.any(PointerEvent),
        MouseEventTypes.Click,
        expect.any(Object),
      );
      expect(callback).toHaveBeenNthCalledWith(
        2,
        expect.any(PointerEvent),
        MouseEventTypes.Click,
        expect.any(Object),
      );
      expect(callback).toHaveBeenNthCalledWith(
        3,
        expect.any(PointerEvent),
        MouseEventTypes.DoubleClick,
        expect.any(Object),
      );
    });
  });

  describe("hook options", () => {
    describe("eventType option", () => {
      it("should handle only configured event types", () => {
        const callback = vi.fn();
        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Down],
          }),
        );

        dispatchPointerEvent("pointermove");
        dispatchPointerEvent("pointerdown");
        dispatchPointerEvent("pointerup");

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(PointerEvent),
          MouseEventTypes.Down,
          expect.any(Object),
        );
      });
    });

    describe("eventButtons option", () => {
      it("should ignore events for disallowed button", () => {
        const callback = vi.fn();
        renderHook(() =>
          useMouse(callback, { eventButtons: [MouseButtons.Right] }),
        );

        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          button: MouseButtons.Left,
        });

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle allowed button", () => {
        const callback = vi.fn();
        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Up],
            eventButtons: [MouseButtons.Right],
          }),
        );

        dispatchPointerEvent("pointerup", 0, 0, globalThis, {
          button: MouseButtons.Right,
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const addEventListenerSpy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useMouse(vi.fn(), {
            eventType: [MouseEventTypes.Down],
            eventCapture: true,
          }),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "pointerdown",
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );
      });

      it("should attach listeners with capture when false", () => {
        const addEventListenerSpy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          useMouse(vi.fn(), {
            eventType: [MouseEventTypes.Down],
            eventCapture: false,
          }),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          "pointerdown",
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );
      });
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
        const callback = vi.fn();
        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Down],
            eventOnce: true,
          }),
        );

        dispatchPointerEvent("pointerdown");
        dispatchPointerEvent("pointerdown");

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Down],
            eventOnce: false,
          }),
        );

        dispatchPointerEvent("pointerdown");
        dispatchPointerEvent("pointerdown");

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should stop immediate propagation when true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Down],
            eventStopImmediatePropagation: true,
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
        const stopSpy = vi.spyOn(event, "stopImmediatePropagation");

        expect(stopSpy).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).not.toHaveBeenCalled();
      });

      it("should not stop immediate propagation when false", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Down],
            eventStopImmediatePropagation: false,
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
        const stopSpy = vi.spyOn(event, "stopImmediatePropagation");

        expect(stopSpy).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(otherCallback).toHaveBeenCalledTimes(1);
      });
    });

    describe("container option", () => {
      it("should attach listeners to custom container", () => {
        const callback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          useMouse(callback, {
            eventType: [MouseEventTypes.Down],
            container,
          }),
        );

        dispatchPointerEvent("pointerdown", 10, 20, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() =>
        useMouse(callback, { eventType: [MouseEventTypes.Down] }),
      );

      dispatchPointerEvent("pointerdown", 0, 0, globalThis, {
        isPrimary: false,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
