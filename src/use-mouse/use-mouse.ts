import { useCallback, useMemo, useRef } from "react";
import {
  MouseData,
  MouseButton,
  MouseButtons,
  MouseEventType,
  MouseEventTypes,
  MouseOptions,
  UseMouseCallback,
  UseMouseOptions,
} from "./use-mouse.types";
import { usePointer } from "../use-pointer";
import {
  PointerData,
  PointerEventPointerTypes,
  PointerEventType,
  PointerEventTypes,
  PointerOptions,
} from "../use-pointer/use-pointer.types";

const defaultOptions: MouseOptions = {
  eventType: [
    MouseEventTypes.Move,
    MouseEventTypes.Down,
    MouseEventTypes.Up,
    MouseEventTypes.Click,
    MouseEventTypes.DoubleClick,
  ],
  eventButtons: [MouseButtons.Left, MouseButtons.Middle, MouseButtons.Right],
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  container: { current: null },
};

const clickThreshold = 300;
const clickDistanceThreshold = 8;

const mapMouseTypesToPointerTypes = (
  eventTypes: MouseEventType[],
): PointerEventType[] => {
  const pointerTypes = new Set<PointerEventType>();

  eventTypes.forEach((type) => {
    if (type === MouseEventTypes.Move) {
      pointerTypes.add(PointerEventTypes.Move);
      return;
    }

    if (type === MouseEventTypes.Down) {
      pointerTypes.add(PointerEventTypes.Down);
      return;
    }

    if (
      type === MouseEventTypes.Up ||
      type === MouseEventTypes.Click ||
      type === MouseEventTypes.DoubleClick
    ) {
      pointerTypes.add(PointerEventTypes.Up);
    }
  });

  return [...pointerTypes];
};

const useMouse = (
  mouseCallback: UseMouseCallback,
  options: UseMouseOptions = {},
) => {
  const {
    eventType,
    eventButtons,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    container,
  } = { ...defaultOptions, ...options };

  const lastClickReference = useRef<{
    time: number;
    x: number;
    y: number;
    button: number;
  } | null>(null);

  const pointerEventType = useMemo(
    () => mapMouseTypesToPointerTypes(eventType),
    [eventType],
  );

  const pointerOptions = useMemo<Partial<PointerOptions>>(
    () => ({
      eventType: pointerEventType,
      eventPointerTypes: [PointerEventPointerTypes.Mouse],
      eventCapture,
      eventOnce,
      eventStopImmediatePropagation,
      container,
    }),
    [
      container,
      eventCapture,
      eventOnce,
      eventStopImmediatePropagation,
      pointerEventType,
    ],
  );

  const handleMouse = useCallback(
    (event: PointerEvent, type: PointerEventType, data: PointerData) => {
      let shouldPrevent = false;

      const button = event.button as MouseButton;

      const isMoveEvent = type === PointerEventTypes.Move;
      const isAllowedButton = eventButtons.includes(button);

      if (!isMoveEvent && !isAllowedButton) {
        return false;
      }

      const mouseData: MouseData = {
        x: data.x,
        y: data.y,
      };

      if (
        type === PointerEventTypes.Move &&
        eventType.includes(MouseEventTypes.Move)
      ) {
        shouldPrevent =
          mouseCallback(event, MouseEventTypes.Move, button, mouseData) ===
            true || shouldPrevent;
      }

      if (
        type === PointerEventTypes.Down &&
        eventType.includes(MouseEventTypes.Down)
      ) {
        shouldPrevent =
          mouseCallback(event, MouseEventTypes.Down, button, mouseData) ===
            true || shouldPrevent;
      }

      if (type === PointerEventTypes.Up) {
        if (eventType.includes(MouseEventTypes.Up)) {
          shouldPrevent =
            mouseCallback(event, MouseEventTypes.Up, button, mouseData) ===
              true || shouldPrevent;
        }

        if (eventType.includes(MouseEventTypes.Click)) {
          shouldPrevent =
            mouseCallback(event, MouseEventTypes.Click, button, mouseData) ===
              true || shouldPrevent;
        }

        if (eventType.includes(MouseEventTypes.DoubleClick)) {
          const now = Date.now();
          const lastClick = lastClickReference.current;

          if (lastClick) {
            const deltaTime = now - lastClick.time;
            const deltaX = event.clientX - lastClick.x;
            const deltaY = event.clientY - lastClick.y;
            const distance = Math.hypot(deltaX, deltaY);

            if (
              deltaTime <= clickThreshold &&
              distance <= clickDistanceThreshold &&
              event.button === lastClick.button
            ) {
              shouldPrevent =
                mouseCallback(
                  event,
                  MouseEventTypes.DoubleClick,
                  button,
                  mouseData,
                ) === true || shouldPrevent;

              lastClickReference.current = null;
            } else {
              lastClickReference.current = {
                time: now,
                x: event.clientX,
                y: event.clientY,
                button: event.button,
              };
            }
          } else {
            lastClickReference.current = {
              time: now,
              x: event.clientX,
              y: event.clientY,
              button: event.button,
            };
          }
        }
      }

      if (!shouldPrevent) {
        return false;
      }

      return true;
    },
    [eventButtons, eventType, mouseCallback],
  );

  usePointer(handleMouse, pointerOptions);
};

export default useMouse;
