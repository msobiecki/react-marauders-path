import {
  type UseDoubleTapCallback,
  type UseDoubleTapOptions,
} from "../use-double-tap";
import { type UseDragCallback, type UseDragOptions } from "../use-drag";
import { type UsePinchCallback, type UsePinchOptions } from "../use-pinch";
import { type UsePressCallback, type UsePressOptions } from "../use-press";
import {
  type SwipeDirection,
  type UseSwipeCallback,
  type UseSwipeOptions,
} from "../use-swipe";
import { type UseTapCallback, type UseTapOptions } from "../use-tap";

export const GestureTypes = {
  Tap: "tap",
  DoubleTap: "doubletap",
  Press: "press",
  Swipe: "swipe",
  Drag: "drag",
  Pinch: "pinch",
} as const;

export type GestureType = (typeof GestureTypes)[keyof typeof GestureTypes];

export type UseGestureSchema = GestureType;

interface UseGestureCallbackMap {
  [GestureTypes.Tap]: UseTapCallback;
  [GestureTypes.DoubleTap]: UseDoubleTapCallback;
  [GestureTypes.Press]: UsePressCallback;
  [GestureTypes.Swipe]: UseSwipeCallback;
  [GestureTypes.Drag]: UseDragCallback;
  [GestureTypes.Pinch]: UsePinchCallback;
}

interface UseGestureOptionsMap {
  [GestureTypes.Tap]: UseTapOptions;
  [GestureTypes.DoubleTap]: UseDoubleTapOptions;
  [GestureTypes.Press]: UsePressOptions;
  [GestureTypes.Swipe]:
    | ({ direction: SwipeDirection } & UseSwipeOptions)
    | UseSwipeOptions;
  [GestureTypes.Drag]: UseDragOptions;
  [GestureTypes.Pinch]: UsePinchOptions;
}

export type UseGestureCallback<T extends UseGestureSchema> =
  UseGestureCallbackMap[T];

export type UseGestureOptions<T extends UseGestureSchema> =
  UseGestureOptionsMap[T];
