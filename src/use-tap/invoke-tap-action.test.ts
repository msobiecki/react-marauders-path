import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

import { invokeTapAction } from "./invoke-tap-action";
import { TapData } from "./use-tap.types";

describe("invokeTapAction", () => {
  let mockEvent: PointerEvent;
  let mockData: TapData;
  let mockCallback: Mock<
    | ((...arguments_: [PointerEvent, TapData]) => boolean)
    | ((...arguments_: [PointerEvent, TapData]) => void)
  >;

  beforeEach(() => {
    mockEvent = new PointerEvent("pointerdown", { pointerType: "touch" });
    mockData = {
      x: 0,
      y: 0,
    };
    mockEvent.preventDefault = vi.fn();
    mockEvent.stopImmediatePropagation = vi.fn();
    mockCallback = vi.fn();
  });

  describe("callback invocation", () => {
    it("should invoke the callback with event direction and data", () => {
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(mockEvent, mockData);
    });

    it("should pass correct parameters to callback", () => {
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockCallback).toHaveBeenCalledWith(mockEvent, mockData);
    });
  });

  describe("preventDefault behavior", () => {
    it("should call preventDefault when callback returns true", () => {
      mockCallback.mockReturnValue(true);
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should not call preventDefault when callback returns false", () => {
      mockCallback.mockReturnValue(false);
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it("should not call preventDefault when callback returns undefined", () => {
      mockCallback.mockReturnValue(undefined);
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it("should not call preventDefault when callback returns void", () => {
      mockCallback.mockImplementation(() => {
        /* no return */
      });
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("stopImmediatePropagation behavior", () => {
    it("should call stopImmediatePropagation when option is true", () => {
      invokeTapAction(mockEvent, mockData, mockCallback, {
        stopImmediate: true,
      });
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
    });

    it("should not call stopImmediatePropagation when option is false", () => {
      invokeTapAction(mockEvent, mockData, mockCallback, {
        stopImmediate: false,
      });
      expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    });

    it("should not call stopImmediatePropagation when option is undefined", () => {
      invokeTapAction(mockEvent, mockData, mockCallback, {});
      expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    });
  });

  describe("once option", () => {
    it("should invoke onOnce callback when once is true", () => {
      const onOnceMock = vi.fn();
      invokeTapAction(mockEvent, mockData, mockCallback, {
        once: true,
        onOnce: onOnceMock,
      });
      expect(onOnceMock).toHaveBeenCalled();
    });

    it("should not invoke onOnce callback when once is false", () => {
      const onOnceMock = vi.fn();
      invokeTapAction(mockEvent, mockData, mockCallback, {
        once: false,
        onOnce: onOnceMock,
      });
      expect(onOnceMock).not.toHaveBeenCalled();
    });

    it("should not invoke onOnce callback when option is undefined", () => {
      const onOnceMock = vi.fn();
      invokeTapAction(mockEvent, mockData, mockCallback, {
        onOnce: onOnceMock,
      });
      expect(onOnceMock).not.toHaveBeenCalled();
    });

    it("should not fail if onOnce is not provided", () => {
      expect(() => {
        invokeTapAction(mockEvent, mockData, mockCallback, {
          once: true,
        });
      }).not.toThrow();
    });
  });

  describe("combined options", () => {
    it("should handle stopImmediate and preventDefault together", () => {
      mockCallback.mockReturnValue(true);
      invokeTapAction(mockEvent, mockData, mockCallback, {
        stopImmediate: true,
      });
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should handle all options together", () => {
      const onOnceMock = vi.fn();
      mockCallback.mockReturnValue(true);
      invokeTapAction(mockEvent, mockData, mockCallback, {
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

      invokeTapAction(mockEvent, mockData, mockCallback, {
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

      invokeTapAction(mockEvent, mockData, mockCallback, {});

      expect(callOrder).toEqual(["callback", "preventDefault"]);
    });
  });
});
