import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const {
  useTapMock,
  useDoubleTapMock,
  usePressMock,
  useSwipeMock,
  useDragMock,
  usePinchMock,
} = vi.hoisted(() => ({
  useTapMock: vi.fn(),
  useDoubleTapMock: vi.fn(),
  usePressMock: vi.fn(),
  useSwipeMock: vi.fn(),
  useDragMock: vi.fn(),
  usePinchMock: vi.fn(),
}));

vi.mock("../use-tap", () => ({
  useTap: useTapMock,
}));

vi.mock("../use-double-tap", () => ({
  useDoubleTap: useDoubleTapMock,
}));

vi.mock("../use-press", () => ({
  usePress: usePressMock,
}));

vi.mock("../use-swipe", () => ({
  SwipeDirections: {
    Left: "left",
    Right: "right",
    Up: "up",
    Down: "down",
    Horizontal: "horizontal",
    Vertical: "vertical",
    Both: "both",
  },
  useSwipe: useSwipeMock,
}));

vi.mock("../use-drag", () => ({
  useDrag: useDragMock,
}));

vi.mock("../use-pinch", () => ({
  usePinch: usePinchMock,
}));

import useGesture from "./use-gesture";

describe("useGesture hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates tap gesture to useTap", () => {
    const callback = vi.fn();
    const options = { threshold: 10 };

    renderHook(() => useGesture("tap", callback, options));

    expect(useTapMock).toHaveBeenCalledTimes(1);
    expect(useTapMock).toHaveBeenCalledWith(callback, options);

    expect(useDoubleTapMock).not.toHaveBeenCalled();
    expect(usePressMock).not.toHaveBeenCalled();
    expect(useSwipeMock).not.toHaveBeenCalled();
    expect(useDragMock).not.toHaveBeenCalled();
    expect(usePinchMock).not.toHaveBeenCalled();
  });

  it("delegates doubletap gesture to useDoubleTap", () => {
    const callback = vi.fn();
    const options = { delay: 250 };

    renderHook(() => useGesture("doubletap", callback, options));

    expect(useDoubleTapMock).toHaveBeenCalledTimes(1);
    expect(useDoubleTapMock).toHaveBeenCalledWith(callback, options);

    expect(useTapMock).not.toHaveBeenCalled();
    expect(usePressMock).not.toHaveBeenCalled();
    expect(useSwipeMock).not.toHaveBeenCalled();
    expect(useDragMock).not.toHaveBeenCalled();
    expect(usePinchMock).not.toHaveBeenCalled();
  });

  it("delegates press gesture to usePress", () => {
    const callback = vi.fn();
    const options = { delay: 400, threshold: 16 };

    renderHook(() => useGesture("press", callback, options));

    expect(usePressMock).toHaveBeenCalledTimes(1);
    expect(usePressMock).toHaveBeenCalledWith(callback, options);

    expect(useTapMock).not.toHaveBeenCalled();
    expect(useDoubleTapMock).not.toHaveBeenCalled();
    expect(useSwipeMock).not.toHaveBeenCalled();
    expect(useDragMock).not.toHaveBeenCalled();
    expect(usePinchMock).not.toHaveBeenCalled();
  });

  it("delegates swipe gesture to useSwipe and uses default direction when missing", () => {
    const callback = vi.fn();
    const options = { threshold: 123 };

    renderHook(() => useGesture("swipe", callback, options));

    expect(useSwipeMock).toHaveBeenCalledTimes(1);
    expect(useSwipeMock).toHaveBeenCalledWith("both", callback, options);
  });

  it("delegates swipe gesture to useSwipe with explicit direction and strips it from swipe options", () => {
    const callback = vi.fn();
    const options = {
      direction: "left",
      threshold: 50,
      velocity: 0.5,
    };

    renderHook(() => useGesture("swipe", callback, options));

    expect(useSwipeMock).toHaveBeenCalledTimes(1);
    expect(useSwipeMock).toHaveBeenCalledWith("left", callback, {
      threshold: 50,
      velocity: 0.5,
    });
  });

  it("delegates drag gesture to useDrag", () => {
    const callback = vi.fn();
    const options = { threshold: 5, raf: true };

    renderHook(() => useGesture("drag", callback, options));

    expect(useDragMock).toHaveBeenCalledTimes(1);
    expect(useDragMock).toHaveBeenCalledWith(callback, options);

    expect(useTapMock).not.toHaveBeenCalled();
    expect(useDoubleTapMock).not.toHaveBeenCalled();
    expect(usePressMock).not.toHaveBeenCalled();
    expect(useSwipeMock).not.toHaveBeenCalled();
    expect(usePinchMock).not.toHaveBeenCalled();
  });

  it("delegates pinch gesture to usePinch", () => {
    const callback = vi.fn();
    const options = { threshold: 0.1, raf: true };

    renderHook(() => useGesture("pinch", callback, options));

    expect(usePinchMock).toHaveBeenCalledTimes(1);
    expect(usePinchMock).toHaveBeenCalledWith(callback, options);

    expect(useTapMock).not.toHaveBeenCalled();
    expect(useDoubleTapMock).not.toHaveBeenCalled();
    expect(usePressMock).not.toHaveBeenCalled();
    expect(useSwipeMock).not.toHaveBeenCalled();
    expect(useDragMock).not.toHaveBeenCalled();
  });

  it("throws when gesture changes between renders", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      ({ gesture }: { gesture: "tap" | "swipe" }) =>
        useGesture(gesture, callback as never, {} as never),
      {
        initialProps: { gesture: "tap" as "tap" | "swipe" },
      },
    );

    expect(() => {
      rerender({ gesture: "swipe" as const });
    }).toThrowError(
      "useGesture does not support changing gesture type between renders.",
    );
  });
});
