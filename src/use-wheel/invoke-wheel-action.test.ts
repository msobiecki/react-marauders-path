import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

import { invokeWheelAction } from "./invoke-wheel-action";
import { WheelData } from "./use-wheel.types";

describe("invokeWheelAction", () => {
  let mockEvent: WheelEvent;
  let mockData: WheelData;
  let mockCallback: Mock<
    | ((...arguments_: [WheelEvent, WheelData]) => boolean)
    | ((...arguments_: [WheelEvent, WheelData]) => void)
  >;

  beforeEach(() => {
    mockEvent = new WheelEvent("wheel", { deltaX: 0, deltaY: 0, deltaZ: 0 });
    mockData = { deltaX: 0, deltaY: 0, deltaZ: 0, deltaMode: 0 };
    mockEvent.preventDefault = vi.fn();
    mockEvent.stopImmediatePropagation = vi.fn();
    mockCallback = vi.fn();
  });

  describe("callback invocation", () => {
    it("should invoke the callback with event and data", () => {
      invokeWheelAction(mockEvent, mockData, mockCallback, {});
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(mockEvent, mockData);
    });
  });

  describe("preventDefault behavior", () => {
    it("should call preventDefault when callback returns true", () => {
      mockCallback.mockReturnValue(true);
      invokeWheelAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should not call preventDefault when callback returns false", () => {
      mockCallback.mockReturnValue(false);
      invokeWheelAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it("should not call preventDefault when callback returns undefined", () => {
      mockCallback.mockReturnValue(undefined);
      invokeWheelAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it("should not call preventDefault when callback returns void", () => {
      mockCallback.mockImplementation(() => {
        /* no return */
      });
      invokeWheelAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("stopImmediatePropagation behavior", () => {
    it("should call stopImmediatePropagation when option is true", () => {
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        stopImmediate: true,
      });
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
    });

    it("should not call stopImmediatePropagation when option is false", () => {
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        stopImmediate: false,
      });
      expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    });

    it("should not call stopImmediatePropagation when option is undefined", () => {
      invokeWheelAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    });
  });

  describe("once option", () => {
    it("should invoke onOnce callback when once is true", () => {
      const onOnceMock = vi.fn();
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        once: true,
        onOnce: onOnceMock,
      });
      expect(onOnceMock).toHaveBeenCalled();
    });

    it("should not invoke onOnce callback when once is false", () => {
      const onOnceMock = vi.fn();
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        once: false,
        onOnce: onOnceMock,
      });
      expect(onOnceMock).not.toHaveBeenCalled();
    });

    it("should not invoke onOnce callback when option is undefined", () => {
      const onOnceMock = vi.fn();
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        onOnce: onOnceMock,
      });
      expect(onOnceMock).not.toHaveBeenCalled();
    });

    it("should not fail if onOnce is not provided", () => {
      expect(() => {
        invokeWheelAction(mockEvent, mockData, mockCallback, {
          once: true,
        });
      }).not.toThrow();
    });
  });

  describe("combined options", () => {
    it("should handle stopImmediate and preventDefault together", () => {
      mockCallback.mockReturnValue(true);
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        stopImmediate: true,
      });
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should handle all options together", () => {
      const onOnceMock = vi.fn();
      mockCallback.mockReturnValue(true);
      invokeWheelAction(mockEvent, mockData, mockCallback, {
        stopImmediate: true,
        once: true,
        onOnce: onOnceMock,
      });
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onOnceMock).toHaveBeenCalled();
    });
  });

  describe("callback execution order", () => {
    it("should call stopImmediatePropagation before callback", () => {
      const callOrder: string[] = [];
      mockEvent.stopImmediatePropagation = vi.fn(() => {
        callOrder.push("stopImmediate");
      });
      mockCallback.mockImplementation(() => {
        callOrder.push("callback");
      });

      invokeWheelAction(mockEvent, mockData, mockCallback, {
        stopImmediate: true,
      });

      expect(callOrder).toEqual(["stopImmediate", "callback"]);
    });

    it("should call preventDefault after callback", () => {
      const callOrder: string[] = [];
      mockCallback.mockImplementation(() => {
        callOrder.push("callback");
        return true;
      });
      mockEvent.preventDefault = vi.fn(() => {
        callOrder.push("preventDefault");
      });

      invokeWheelAction(mockEvent, mockData, mockCallback, {});

      expect(callOrder).toEqual(["callback", "preventDefault"]);
    });
  });
});
