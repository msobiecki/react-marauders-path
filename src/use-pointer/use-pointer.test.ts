import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";

import usePointer from "./use-pointer";
import {
  PointerEventPointerTypes,
  PointerEventTypes,
} from "./use-pointer.types";

const dispatchPointerEvent = (
  type: string,
  clientX = 10,
  clientY = 20,
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

describe("usePointer hook", () => {
  describe("basic pointer handling", () => {
    it("should invoke callback with event type and data", () => {
      const callback = vi.fn();
      renderHook(() => usePointer(callback));

      dispatchPointerEvent(PointerEventTypes.Down, 14, 23);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.any(PointerEvent),
        PointerEventTypes.Down,
        expect.objectContaining({ x: 14, y: 23 }),
      );
    });

    it("should handle multiple pointer events", () => {
      const callback = vi.fn();
      renderHook(() => usePointer(callback));

      dispatchPointerEvent(PointerEventTypes.Down);
      dispatchPointerEvent(PointerEventTypes.Move);
      dispatchPointerEvent(PointerEventTypes.Up);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback.mock.calls.map((call) => call[1])).toEqual([
        PointerEventTypes.Down,
        PointerEventTypes.Move,
        PointerEventTypes.Up,
      ]);
    });
  });

  describe("hook options", () => {
    describe("eventType option", () => {
      it("should handle only configured event types", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePointer(callback, {
            eventType: [PointerEventTypes.Down],
          }),
        );

        dispatchPointerEvent(PointerEventTypes.Move);
        dispatchPointerEvent(PointerEventTypes.Down);
        dispatchPointerEvent(PointerEventTypes.Up);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
          expect.any(PointerEvent),
          PointerEventTypes.Down,
          expect.any(Object),
        );
      });
    });

    describe("eventPointerTypes option", () => {
      it("should ignore pointer types not included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePointer(callback, {
            eventPointerTypes: [PointerEventPointerTypes.Mouse],
          }),
        );

        dispatchPointerEvent(PointerEventTypes.Down, 0, 0, globalThis, {
          pointerType: PointerEventPointerTypes.Touch,
        });

        expect(callback).not.toHaveBeenCalled();
      });

      it("should handle pointer types included in eventPointerTypes", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePointer(callback, {
            eventPointerTypes: [PointerEventPointerTypes.Mouse],
          }),
        );

        dispatchPointerEvent(PointerEventTypes.Down, 0, 0, globalThis, {
          pointerType: PointerEventPointerTypes.Mouse,
        });

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("eventCapture option", () => {
      it("should attach listeners with capture when true", () => {
        const addEventListenerSpy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          usePointer(vi.fn(), {
            eventCapture: true,
          }),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          PointerEventTypes.Down,
          expect.any(Function),
          expect.objectContaining({ capture: true }),
        );
      });

      it("should attach listeners with capture when false", () => {
        const addEventListenerSpy = vi.spyOn(globalThis, "addEventListener");

        renderHook(() =>
          usePointer(vi.fn(), {
            eventCapture: false,
          }),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith(
          PointerEventTypes.Down,
          expect.any(Function),
          expect.objectContaining({ capture: false }),
        );
      });
    });

    describe("eventOnce option", () => {
      it("should respect eventOnce option - true", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePointer(callback, {
            eventType: [PointerEventTypes.Down],
            eventOnce: true,
          }),
        );

        dispatchPointerEvent(PointerEventTypes.Down);
        dispatchPointerEvent(PointerEventTypes.Down);

        expect(callback).toHaveBeenCalledTimes(1);
      });

      it("should respect eventOnce option - false", () => {
        const callback = vi.fn();
        renderHook(() =>
          usePointer(callback, {
            eventType: [PointerEventTypes.Down],
            eventOnce: false,
          }),
        );

        dispatchPointerEvent(PointerEventTypes.Down);
        dispatchPointerEvent(PointerEventTypes.Down);

        expect(callback).toHaveBeenCalledTimes(2);
      });
    });

    describe("eventStopImmediatePropagation option", () => {
      it("should stop immediate propagation when true", () => {
        const callback = vi.fn();
        const otherCallback = vi.fn();
        const container = { current: document.createElement("div") };

        renderHook(() =>
          usePointer(callback, {
            eventType: [PointerEventTypes.Down],
            eventStopImmediatePropagation: true,
            container,
          }),
        );

        container.current.addEventListener("pointerdown", otherCallback);

        const event = dispatchPointerEvent(
          PointerEventTypes.Down,
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
          usePointer(callback, {
            eventType: [PointerEventTypes.Down],
            eventStopImmediatePropagation: false,
            container,
          }),
        );

        container.current.addEventListener("pointerdown", otherCallback);

        const event = dispatchPointerEvent(
          PointerEventTypes.Down,
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
          usePointer(callback, {
            eventType: [PointerEventTypes.Down],
            container,
          }),
        );

        dispatchPointerEvent(PointerEventTypes.Down, 10, 20, container.current);

        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("event guards", () => {
    it("should ignore non-primary pointer events", () => {
      const callback = vi.fn();
      renderHook(() =>
        usePointer(callback, { eventType: [PointerEventTypes.Down] }),
      );

      dispatchPointerEvent(PointerEventTypes.Down, 0, 0, globalThis, {
        isPrimary: false,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
