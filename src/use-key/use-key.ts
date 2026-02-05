import { useCallback, useEffect, useRef } from "react";

import type {
  KeyOptions,
  SequenceState,
  UseKeySchema,
  UseKeyCallback,
  UseKeyOptions,
} from "./use-key.types";
import { parseKeySequences } from "./parse-key-sequences";
import { advanceSequenceState, resetSequenceState } from "./sequence-state";
import { invokeKeyAction } from "./invoke-key-action";
import { shouldHandleKeyboardEvent } from "./event-gruards";

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
  keyCallback: UseKeyCallback,
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
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const listenerReference = useRef<EventListener | null>(null);
  const firedOnceReference = useRef(false);
  const sequenceReference = useRef<SequenceState[]>([]);

  const destroyListener = useCallback(() => {
    if (targetReference.current && listenerReference.current) {
      targetReference.current.removeEventListener(
        eventType,
        listenerReference.current,
      );
    }
  }, [eventType]);

  const resetSequence = useCallback((sequence: SequenceState) => {
    sequenceReference.current = resetSequenceState(
      sequence,
      sequenceReference.current,
    );
  }, []);

  const handleEventListener = useCallback(
    (event: KeyboardEvent) => {
      if (
        !shouldHandleKeyboardEvent(event, {
          once: eventOnce,
          repeat: eventRepeat,
          firedOnce: firedOnceReference.current,
        })
      ) {
        return;
      }

      sequenceReference.current.forEach((sequence) => {
        // Single key
        if (sequence.chord.length === 1) {
          if (sequence.chord[0] !== event.key) return;

          invokeKeyAction(event, sequence.key, keyCallback, {
            stopImmediate: eventStopImmediatePropagation,
            once: eventOnce,
            onOnce: () => {
              firedOnceReference.current = true;
              destroyListener();
            },
          });

          return;
        }

        // Key sequence
        const expectedKey = sequence.chord[sequence.index];
        if (event.key !== expectedKey) {
          resetSequence(sequence);
          return;
        }

        const [updatedSequence, updatedSequences] = advanceSequenceState(
          sequence,
          sequenceReference.current,
          sequenceTimeout,
          resetSequence,
        );
        sequenceReference.current = updatedSequences;

        if (updatedSequence.index === updatedSequence.chord.length) {
          invokeKeyAction(event, updatedSequence.key, keyCallback, {
            stopImmediate: eventStopImmediatePropagation,
            once: eventOnce,
            onOnce: () => {
              firedOnceReference.current = true;
              destroyListener();
            },
          });

          resetSequence(updatedSequence);
        }
      });
    },
    [
      keyCallback,
      destroyListener,
      eventOnce,
      eventRepeat,
      eventStopImmediatePropagation,
      resetSequence,
      sequenceTimeout,
    ],
  );

  useEffect(() => {
    sequenceReference.current = parseKeySequences(key);
  }, [key]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;

    const eventListener = (event: Event) =>
      handleEventListener(event as KeyboardEvent);

    targetReference.current.addEventListener(eventType, eventListener, {
      capture: eventCapture,
    });

    listenerReference.current = eventListener;
    return () => {
      targetReference.current?.removeEventListener(eventType, eventListener);
      listenerReference.current = null;
      sequenceReference.current.forEach((sequence) => resetSequence(sequence));
    };
  }, [eventType, eventCapture, container, handleEventListener, resetSequence]);
};

export const useKeyOnce = (
  key: UseKeySchema,
  keyCallback: UseKeyCallback,
  options: Omit<UseKeyOptions, "eventOnce"> = defaultOptions,
) => useKey(key, keyCallback, { ...options, eventOnce: true });

export default useKey;
