import { useCallback, useEffect, useRef } from "react";

import {
  KeyOptions,
  SequenceState,
  UseKeySchema,
  UseKeyCallback,
  UseKeyOptions,
} from "./use-key.types";
import { parseKeySequences } from "./parse-key-sequences";
import { advanceSequenceState, resetSequenceState } from "./sequence-state";
import { invokeKeyAction } from "./invoke-key-action";
import { shouldHandleKeyboardEvent } from "./event-guards";
import { SPECIAL_KEYS } from "./normalize-key";

const defaultOptions: KeyOptions = {
  eventType: "keyup",
  eventRepeat: false,
  eventCapture: false,
  eventOnce: false,
  eventStopImmediatePropagation: false,
  sequenceThreshold: 1000,
  combinationThreshold: 100,
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
 * @param {string} [options.eventType='keyup'] - Type of keyboard event ('keydown' or 'keyup')
 * @param {boolean} [options.eventRepeat=false] - Allow repeated key presses to trigger callback
 * @param {boolean} [options.eventCapture=false] - Use event capture phase instead of bubbling
 * @param {boolean} [options.eventOnce=false] - Trigger callback only once
 * @param {boolean} [options.eventStopImmediatePropagation=false] - Stop immediate propagation
 * @param {number} [options.sequenceThreshold=1000] - Timeout in ms between sequence keys
 * @param {number} [options.combinationThreshold=100] - Timeout in ms between combination keys
 * @param {RefObject<HTMLElement>} [options.container] - DOM element to attach listener to (default: window)
 *
 * @example
 * // Single key schema
 * useKey('a', (event, key) => console.log(`Pressed ${key}`));
 *
 * @example
 * // Multiple patterns of single keys schema
 * useKey(['a', 'b', 'c'], (event, key) => console.log(`Pressed ${key}`));
 *
 * @example
 * // Sequential keys schema
 * useKey('ArrowUp ArrowUp ArrowDown ArrowDown', (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Multiple patterns of sequential keys schema
 * useKey(['ArrowUp ArrowUp ArrowDown ArrowDown', 'ArrowLeft ArrowRight'], (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Combination keys schema
 * useKey('a+b', (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Multiple patterns of combination keys schema
 * useKey(['a+b', 'c+d'], (event, key) => {
 *   console.log(`Pressed ${key}`);
 * });
 *
 * @example
 * // Using options to listen for a key on keydown event and stop propagation
 * useKey('Any', handleSubmit, {
 *   eventType: 'keydown',
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
    // combinationThreshold,
    container,
  } = { ...defaultOptions, ...options };

  const targetReference = useRef<EventTarget | null>(null);
  const abortControllerReference = useRef<AbortController | null>(null);
  const firedOnceReference = useRef(false);
  const sequenceReference = useRef<SequenceState[]>([]);

  const destroyListener = useCallback(() => {
    if (abortControllerReference.current) {
      abortControllerReference.current.abort();
    }
  }, []);

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
          const expectedKey = sequence.chord[0];

          if (expectedKey !== SPECIAL_KEYS.ANY && expectedKey !== event.key) {
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

        // Sequence of keys
        const expectedKey = sequence.chord[sequence.index];
        if (expectedKey !== SPECIAL_KEYS.ANY && expectedKey !== event.key) {
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
      });
    },
    [
      keyCallback,
      destroyListener,
      eventOnce,
      eventRepeat,
      eventStopImmediatePropagation,
      resetSequence,
      sequenceThreshold,
    ],
  );

  useEffect(() => {
    sequenceReference.current = parseKeySequences(key);
  }, [key]);

  useEffect(() => {
    targetReference.current = container?.current ?? globalThis;
    abortControllerReference.current = new AbortController();

    const eventListener = (event: Event) =>
      handleEventListener(event as KeyboardEvent);

    targetReference.current.addEventListener(eventType, eventListener, {
      capture: eventCapture,
      signal: abortControllerReference.current.signal,
    });

    return () => {
      abortControllerReference.current?.abort();
      sequenceReference.current.forEach((sequence) => resetSequence(sequence));
    };
  }, [eventType, eventCapture, container, handleEventListener, resetSequence]);
};

/**
 * React hook for handling keyboard events that trigger only once.
 *
 * Convenience wrapper around useKey with eventOnce automatically set to true.
 * The listener is automatically removed after the first match.
 *
 * @param {UseKeySchema} key - Single key, chord, sequence, or array of patterns
 * @param {UseKeyCallback} keyCallback - Callback function invoked once when pattern matches
 * @param {Omit<UseKeyOptions, 'eventOnce'>} [options] - Configuration options (eventOnce is always true)
 * @returns {void}
 *
 * @example
 * // Listen for Escape key press once
 * useKeyOnce('Escape', () => {
 *   console.log('Escape pressed!');
 *   // Listener automatically removed
 * });
 *
 * @example
 * // One-time save shortcut
 * useKeyOnce('ctrl+s', (event) => {
 *   event.preventDefault();
 *   saveFile();
 * }, { eventType: 'keydown' });
 */
export const useKeyOnce = (
  key: UseKeySchema,
  keyCallback: UseKeyCallback,
  options: Omit<UseKeyOptions, "eventOnce"> = defaultOptions,
) => useKey(key, keyCallback, { ...options, eventOnce: true });

export default useKey;
