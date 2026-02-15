import { RefObject } from "react";

/** Atomic key like 'a', 'ArrowUp', 'Shift' */
export type Key = string;

/** Simultaneous keys like 'a+b' */
export type KeyChord = string;

/** Sequential keys like 'a b' */
export type KeySequence = string;

/** Any valid keyboard pattern */
export type KeyPattern = Key | KeyChord | KeySequence;

export type KeyEvent = KeyPattern | KeyPattern[];

export interface KeyOptions {
  eventType: "keyup" | "keydown";
  eventRepeat: boolean;
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation?: boolean;
  sequenceThreshold: number;
  combinationThreshold: number;
  container: RefObject<HTMLElement | null>;
}

export interface SequenceState {
  key: KeyPattern;
  chord: KeyPattern[];
  index: number;
  sequenceTimeout: ReturnType<typeof setTimeout> | null;
}

export type UseKeySchema = KeyEvent;

export type UseKeyCallback =
  | ((
      event: KeyboardEvent,
      key: KeySequence,
      ...properties: unknown[]
    ) => boolean)
  | ((
      event: KeyboardEvent,
      key: KeySequence,
      ...properties: unknown[]
    ) => void);

export type UseKeyOptions = Partial<KeyOptions>;
