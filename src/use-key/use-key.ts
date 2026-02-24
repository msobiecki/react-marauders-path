import { useCallback, useEffect, useRef } from "react";

import {
  KeyOptions,
  SequenceState,
  UseKeySchema,
  UseKeyCallback,
  UseKeyOptions,
  CombinationState,
  KeyEventTypes,
} from "./use-key.types";
import { parseKeySequences } from "./parse-key-sequences";
import { advanceSequenceState, resetSequenceState } from "./sequence-state";
import { invokeKeyAction } from "./invoke-key-action";
import { shouldHandleKeyboardEvent } from "./event-guards";
import { SPECIAL_KEYS } from "./normalize-key";

const defaultOptions: KeyOptions = {
  eventType: KeyEventTypes.KeyUp,
  eventRepeat: false,
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  sequenceThreshold: 1000,
  combinationThreshold: 200,
  container: { current: null },
};

/**
 * React hook for handling keyboard events with support for key sequences and combinations.
 *
 * Enables listening for single key presses, key combinations, and sequential key presses.
 * Supports customizable options like event type, repeat handling, and one-time listeners.
 *
 * @template T - The callback function type
 * @param {UseKeySchema} key - Single key, combination, sequence, or array of patterns to listen for
 * @param {UseKeyCallback} keyCallback - Callback function invoked when key pattern matches
 * @param {UseKeyOptions} [options] - Configuration options for the hook
 * @param {KeyEventType} [options.eventType=KeyEventTypes.KeyUp] - Type of keyboard event ('keydown' or 'keyup')
 * @param {boolean} [options.eventRepeat=false] - Allow repeated key presses to trigger callback
 * @param {boolean} [options.eventCapture=false] - Use event capture phase instead of bubbling
 * @param {boolean} [options.eventOnce=false] - Trigger callback only once
 * @param {boolean} [options.eventStopImmediatePropagation=false] - Stop immediate propagation
 * @param {number} [options.sequenceThreshold=1000] - Timeout in ms between sequence keys
 * @param {number} [options.combinationThreshold=200] - Timeout in ms between combination keys
 * @param {RefObject<HTMLElement>} [options.container] - DOM element to attach listener to (default: window)
 *
 * @example
 * // Single key schema
 * useKey('a', (event, key) => console.log(`Pressed ${key}`));
 *
 * @example
 * // Multiple patterns of single key schema
 * useKey(['a', 'b', 'c'], (event, key) => console.log(`Pressed ${key}`));
 *
 * @example
 * // Combination key schema
 * useKey('a+b', (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Multiple patterns of combination key schema
 * useKey(['a+b', 'c+d'], (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Sequential key schema
 * useKey('ArrowUp ArrowUp ArrowDown ArrowDown', (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Multiple patterns of sequential key schema
 * useKey(['ArrowUp ArrowUp ArrowDown ArrowDown', 'ArrowLeft ArrowRight'], (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Using options to listen for a key on keydown event and stop propagation
 * useKey('Any', handleSubmit, {
 *   eventType: KeyEventTypes.KeyDown,
 *   eventStopImmediatePropagation: true,
 *   container: inputRef
 * });
 *
 */
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
    sequenceThreshold,
    combinationThreshold,
    container,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);
  const firedOnceReference = useRef(false);
  const combinationReference = useRef<CombinationState>({
    activeKeys: new Map(),
  });
  const sequenceReference = useRef<SequenceState[]>([]);

  const destroyListener = useCallback(() => {
    if (abortControllerReference.current) {
      abortControllerReference.current.abort();
    }
  }, []);

  const resetCombination = useCallback(() => {
    combinationReference.current.activeKeys.clear();
  }, []);

  const resetSequence = useCallback((sequence: SequenceState) => {
    sequenceReference.current = resetSequenceState(
      sequence,
      sequenceReference.current,
    );
  }, []);

  const shouldProcessEvent = useCallback(
    (event: KeyboardEvent) => {
      return shouldHandleKeyboardEvent(event, {
        once: eventOnce,
        repeat: eventRepeat,
        firedOnce: firedOnceReference.current,
      });
    },
    [eventOnce, eventRepeat],
  );

  const registerKeyDown = useCallback((event: KeyboardEvent) => {
    const normalizedEventKey =
      event.key === " " ? SPECIAL_KEYS.SPACE : event.key;
    combinationReference.current.activeKeys.set(normalizedEventKey, {
      pressedAt: Date.now(),
    });
  }, []);

  const registerKeyUp = useCallback((event: KeyboardEvent) => {
    const normalizedEventKey =
      event.key === " " ? SPECIAL_KEYS.SPACE : event.key;
    const state =
      combinationReference.current.activeKeys.get(normalizedEventKey);
    if (state) state.releasedAt = Date.now();
  }, []);

  const cleanupCombinationKeys = useCallback(() => {
    const now = Date.now();
    const combo = combinationReference.current;

    [...combo.activeKeys.entries()].forEach(([key, state]) => {
      if (eventType === KeyEventTypes.KeyDown) {
        if (state.releasedAt) {
          combo.activeKeys.delete(key);
        }
      } else if (
        state.releasedAt &&
        now - state.releasedAt > combinationThreshold
      ) {
        combo.activeKeys.delete(key);
      }
    });
  }, [eventType, combinationThreshold]);

  const validateCombination = useCallback(
    (
      expectedKey: string[],
      activeKeys: Map<string, { pressedAt: number; releasedAt?: number }>,
    ): boolean => {
      if (eventType === KeyEventTypes.KeyDown) {
        return (
          activeKeys.size === expectedKey.length &&
          expectedKey.every((key) => {
            if (key === SPECIAL_KEYS.ANY) {
              return activeKeys.size > 0;
            }
            return activeKeys.has(key);
          })
        );
      }
      if (eventType === KeyEventTypes.KeyUp) {
        const keyStates = expectedKey.map((key) => {
          if (key === SPECIAL_KEYS.ANY) {
            const entries = [...activeKeys.entries()];
            const lastEntry = entries.at(-1);
            return lastEntry ? lastEntry[1] : undefined;
          }
          return activeKeys.get(key);
        });

        if (keyStates.some((state) => !state?.releasedAt)) {
          return false;
        }

        const pressedTimes: number[] = keyStates
          .map((state) => state?.pressedAt)
          .filter((value): value is number => value !== undefined);
        const releasedTimes: number[] = keyStates
          .map((state) => state?.releasedAt)
          .filter((value): value is number => value !== undefined);

        const minReleased = Math.min(...releasedTimes);
        const maxReleased = Math.max(...releasedTimes);
        const maxPressed = Math.max(...pressedTimes);

        if (maxPressed > minReleased) {
          return false;
        }

        if (maxReleased - minReleased > combinationThreshold) {
          return false;
        }

        return true;
      }

      return false;
    },
    [eventType, combinationThreshold],
  );

  const handleSingleKey = useCallback(
    (event: KeyboardEvent, sequence: SequenceState) => {
      const expectedKey = sequence.chord[0];

      if (Array.isArray(expectedKey)) {
        const { activeKeys } = combinationReference.current;

        if (!validateCombination(expectedKey, activeKeys)) {
          return;
        }

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

      const normalizedEventKey =
        event.key === " " ? SPECIAL_KEYS.SPACE : event.key;
      if (
        expectedKey !== SPECIAL_KEYS.ANY &&
        expectedKey !== normalizedEventKey
      ) {
        return;
      }

      invokeKeyAction(event, sequence.key, keyCallback, {
        stopImmediate: eventStopImmediatePropagation,
        once: eventOnce,
        onOnce: () => {
          firedOnceReference.current = true;
          destroyListener();
        },
      });
    },
    [
      eventStopImmediatePropagation,
      eventOnce,
      keyCallback,
      validateCombination,
      destroyListener,
    ],
  );

  const handleSequenceStep = useCallback(
    (event: KeyboardEvent, sequence: SequenceState) => {
      const expectedKey = sequence.chord[sequence.index];

      if (Array.isArray(expectedKey)) {
        const { activeKeys } = combinationReference.current;

        if (!validateCombination(expectedKey, activeKeys)) {
          return;
        }

        const [updatedSequence, updatedSequences] = advanceSequenceState(
          sequence,
          sequenceReference.current,
          sequenceThreshold,
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

        return;
      }

      const normalizedEventKey =
        event.key === " " ? SPECIAL_KEYS.SPACE : event.key;
      if (
        expectedKey !== SPECIAL_KEYS.ANY &&
        expectedKey !== normalizedEventKey
      ) {
        resetSequence(sequence);
        return;
      }

      const [updatedSequence, updatedSequences] = advanceSequenceState(
        sequence,
        sequenceReference.current,
        sequenceThreshold,
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
    },
    [
      eventOnce,
      eventStopImmediatePropagation,
      sequenceThreshold,
      keyCallback,
      resetSequence,
      validateCombination,
      destroyListener,
    ],
  );

  const evaluateSequences = useCallback(
    (event: KeyboardEvent) => {
      sequenceReference.current.forEach((sequence) => {
        if (sequence.chord.length === 1) {
          handleSingleKey(event, sequence);
        } else {
          handleSequenceStep(event, sequence);
        }
      });
    },
    [handleSingleKey, handleSequenceStep],
  );

  const handleEventListener = useCallback(
    (event: KeyboardEvent) => {
      if (!shouldProcessEvent(event)) {
        return;
      }

      cleanupCombinationKeys();
      evaluateSequences(event);
    },
    [shouldProcessEvent, cleanupCombinationKeys, evaluateSequences],
  );

  useEffect(() => {
    sequenceReference.current = parseKeySequences(key);
  }, [key]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const keyDownListener = (event: Event) =>
      registerKeyDown(event as KeyboardEvent);
    targetReference.current.addEventListener("keydown", keyDownListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    const keyUpListener = (event: Event) =>
      registerKeyUp(event as KeyboardEvent);
    targetReference.current.addEventListener("keyup", keyUpListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    const eventListener = (event: Event) =>
      handleEventListener(event as KeyboardEvent);

    targetReference.current.addEventListener(eventType, eventListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    return () => {
      abortControllerReference.current?.abort();

      resetCombination();
      sequenceReference.current.forEach((sequence) => resetSequence(sequence));
    };
  }, [
    eventType,
    eventCapture,
    container,
    registerKeyDown,
    registerKeyUp,
    handleEventListener,
    resetCombination,
    resetSequence,
  ]);
};

export default useKey;
