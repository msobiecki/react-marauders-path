import { RefObject, useCallback, useEffect, useRef } from "react";

type KeyEvent = string | string[];

interface KeyOptions {
  eventType: "keyup" | "keydown";
  eventRepeat: boolean;
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation?: boolean;
  sequenceTimeout: number;
  container: RefObject<HTMLElement | null>;
}

interface SequenceState {
  keys: string[];
  index: number;
  timeout: ReturnType<typeof setTimeout> | null;
}

type UseKeySchema = KeyEvent;

type UseKeyCallback =
  | ((event: KeyboardEvent, key: KeyEvent, ...properties: unknown[]) => boolean)
  | ((event: KeyboardEvent, key: KeyEvent, ...properties: unknown[]) => void);

type UseKeyOptions = Partial<KeyOptions>;

const defaultOptions: KeyOptions = {
  eventType: "keyup",
  eventRepeat: false,
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  sequenceTimeout: 1000,
  container: { current: null },
};

const useKey = (
  key: UseKeySchema,
  callback: UseKeyCallback,
  options: UseKeyOptions = defaultOptions,
) => {
  const {
    eventType,
    eventRepeat,
    eventCapture,
    eventOnce,
    eventStopImmediatePropagation,
    sequenceTimeout,
    container,
  } = {
    ...defaultOptions,
    ...options,
  };

  const targetReference = useRef<EventTarget | null>(null);
  const listenerReference = useRef<EventListener | null>(null);
  const firedOnceReference = useRef(false);
  const sequenceReference = useRef<SequenceState[]>([]);

  const destroyListener = useCallback(() => {
    const target = targetReference.current;
    const listener = listenerReference.current;
    if (!target || !listener) {
      return;
    }
    target.removeEventListener(eventType, listener);
  }, [eventType]);

  const resetSequence = useCallback((sequence: SequenceState) => {
    const resetSequence = { ...sequence, index: 0, timeout: null };

    const index = sequenceReference.current.indexOf(sequence);
    if (index !== -1) {
      sequenceReference.current[index] = resetSequence;
    }

    if (sequence.timeout) {
      clearTimeout(sequence.timeout);
    }
  }, []);

  const handleEventListener = useCallback(
    (event: KeyboardEvent) => {
      if (eventOnce && firedOnceReference.current) {
        return;
      }

      if (!eventRepeat && event.repeat) {
        return;
      }

      sequenceReference.current.forEach((sequence, index) => {
        if (sequence.keys.length === 1) {
          if (sequence.keys[0] === event.key) {
            if (eventStopImmediatePropagation) {
              event.stopImmediatePropagation();
            }
            const shouldPrevent = callback(event, sequence.keys[0]);
            if (shouldPrevent) {
              event.preventDefault();
            }
            if (eventOnce) {
              firedOnceReference.current = true;
              destroyListener();
            }
          }
        } else {
          const expected = sequence.keys[sequence.index];
          if (event.key === expected) {
            const updatedSequence = {
              ...sequence,
              index: sequence.index + 1,
              timeout: sequence.timeout,
            };

            if (sequenceTimeout) {
              if (updatedSequence.timeout) {
                clearTimeout(updatedSequence.timeout);
              }
              updatedSequence.timeout = setTimeout(
                () => resetSequence(updatedSequence),
                sequenceTimeout,
              );
            }

            sequenceReference.current[index] = updatedSequence;

            if (updatedSequence.index === updatedSequence.keys.length) {
              if (eventStopImmediatePropagation) {
                event.stopImmediatePropagation();
              }
              const shouldPrevent = callback(event, updatedSequence.keys);
              if (shouldPrevent) {
                event.preventDefault();
              }
              if (eventOnce) {
                firedOnceReference.current = true;
                destroyListener();
              }
              resetSequence(updatedSequence);
            }
          } else {
            resetSequence(sequence);
          }
        }
      });
    },
    [
      callback,
      destroyListener,
      eventOnce,
      eventRepeat,
      eventStopImmediatePropagation,
      resetSequence,
      sequenceTimeout,
    ],
  );

  useEffect(() => {
    const rawKeys = Array.isArray(key) ? key : [key];
    sequenceReference.current = rawKeys.map((k) => {
      if (typeof k === "string" && k.includes(" ")) {
        return { keys: k.split(" "), index: 0, timeout: null };
      }
      return { keys: [k], index: 0, timeout: null };
    });
  }, [key]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;

    const listener = (event: Event) =>
      handleEventListener(event as KeyboardEvent);

    targetReference.current.addEventListener(eventType, listener, {
      capture: eventCapture,
    });
    listenerReference.current = listener;

    return () => {
      targetReference.current?.removeEventListener(eventType, listener);
      listenerReference.current = null;
      sequenceReference.current.forEach((sequence) => resetSequence(sequence));
    };
  }, [
    eventType,
    container,
    handleEventListener,
    eventCapture,
    eventOnce,
    resetSequence,
  ]);
};

export const useKeyOnce = (
  key: UseKeySchema,
  callback: UseKeyCallback,
  options: Omit<UseKeyOptions, "eventOnce"> = defaultOptions,
) => useKey(key, callback, { ...options, eventOnce: true });

export default useKey;
