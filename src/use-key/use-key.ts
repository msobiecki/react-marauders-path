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
  sequenceTimeout: 1000,
  container: { current: null },
};

/**
 * React hook for handling keyboard events with support for key sequences and chords.
 *
 * Enables listening for single key presses, key combinations (chords), and sequential key presses.
 * Supports customizable options like event type, repeat handling, and one-time listeners.
 *
 * @template T - The callback function type
 * @param {UseKeySchema} key - Single key, chord, sequence, or array of patterns to listen for
 * @param {UseKeyCallback} keyCallback - Callback function invoked when key pattern matches
 * @param {UseKeyOptions} [options] - Configuration options for the hook
 * @param {string} [options.eventType='keyup'] - Type of keyboard event ('keydown' or 'keyup')
 * @param {boolean} [options.eventRepeat=false] - Allow repeated key presses to trigger callback
 * @param {boolean} [options.eventCapture=false] - Use event capture phase instead of bubbling
 * @param {boolean} [options.eventOnce=false] - Trigger callback only once
 * @param {boolean} [options.eventStopImmediatePropagation=false] - Stop immediate propagation
 * @param {number} [options.sequenceTimeout=1000] - Timeout in ms between sequence keys
 * @param {RefObject<HTMLElement>} [options.container] - DOM element to attach listener to (default: window)
 *
 * @example
 * // Single key
 * useKey('a', (event, key) => console.log(`Pressed ${key}`));
 *
 * @example
 * // Keyboard shortcut (chord)
 * useKey('ctrl+s', (event, key) => {
 *   event.preventDefault();
 *   console.log('Save!');
 * });
 *
 * @example
 * // Sequential keys
 * useKey('ArrowUp ArrowUp ArrowDown ArrowDown', (event, key) => {
 *   console.log('Konami code!');
 * }, { sequenceTimeout: 2000 });
 *
 * @example
 * // Multiple patterns
 * useKey(['a', 'b', 'c'], (event, key) => {
 *   console.log(`Matched: ${key}`);
 * });
 *
 * @example
 * // With options
 * useKey('Enter', handleSubmit, {
 *   eventType: 'keydown',
 *   eventStopImmediatePropagation: true,
 *   container: inputRef
 * });
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
