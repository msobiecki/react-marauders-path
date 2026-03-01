import { useRef } from "react";

import { useTap } from "../use-tap";
import { useDoubleTap } from "../use-double-tap";
import { usePress } from "../use-press";
import { SwipeDirections, useSwipe, UseSwipeSchema } from "../use-swipe";
import { useDrag } from "../use-drag";
import { usePinch } from "../use-pinch";

import {
  UseGestureSchema,
  UseGestureCallback,
  UseGestureOptions,
} from "./use-gesture.types";

const useGestureTap = (
  callback: UseGestureCallback<"tap">,
  options: UseGestureOptions<"tap">,
) => {
  useTap(callback, options);
};

const useGestureDoubleTap = (
  callback: UseGestureCallback<"doubletap">,
  options: UseGestureOptions<"doubletap">,
) => {
  useDoubleTap(callback, options);
};

const useGesturePress = (
  callback: UseGestureCallback<"press">,
  options: UseGestureOptions<"press">,
) => {
  usePress(callback, options);
};

const useGestureSwipe = (
  callback: UseGestureCallback<"swipe">,
  options: UseGestureOptions<"swipe">,
) => {
  const { direction = SwipeDirections.Both, ...swipeOptions } =
    options as UseGestureOptions<"swipe"> & {
      direction?: UseSwipeSchema;
    };

  useSwipe(direction, callback, swipeOptions);
};

const useGestureDrag = (
  callback: UseGestureCallback<"drag">,
  options: UseGestureOptions<"drag">,
) => {
  useDrag(callback, options);
};

const useGesturePinch = (
  callback: UseGestureCallback<"pinch">,
  options: UseGestureOptions<"pinch">,
) => {
  usePinch(callback, options);
};

const useGestureMap = {
  tap: useGestureTap,
  doubletap: useGestureDoubleTap,
  press: useGesturePress,
  swipe: useGestureSwipe,
  drag: useGestureDrag,
  pinch: useGesturePinch,
} as const;

const useGesture = <T extends UseGestureSchema>(
  gesture: T,
  callback: UseGestureCallback<T>,
  options: UseGestureOptions<T> = {} as UseGestureOptions<T>,
): void => {
  const initialGestureReference = useRef<T | null>(null);

  if (initialGestureReference.current === null) {
    initialGestureReference.current = gesture;
  }

  const stableGesture = initialGestureReference.current;

  if (gesture !== stableGesture) {
    throw new Error(
      "useGesture does not support changing gesture type between renders.",
    );
  }

  const useSelectedGestureHook = useGestureMap[stableGesture] as (
    callback: UseGestureCallback<T>,
    options: UseGestureOptions<T>,
  ) => void;

  useSelectedGestureHook(callback, options);
};

export default useGesture;
