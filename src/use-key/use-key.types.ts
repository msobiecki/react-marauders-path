import { RefObject } from "react";

export type Key = string;

export type KeyEvent = Key | Key[];

export const KeyEventTypes = {
  KeyUp: "keyup",
  KeyDown: "keydown",
} as const;

export type KeyEventType = (typeof KeyEventTypes)[keyof typeof KeyEventTypes];

export interface KeyOptions {
  eventType: KeyEventType;
  eventRepeat: boolean;
  eventCapture: boolean;
  eventOnce: boolean;
  eventStopImmediatePropagation: boolean;
  sequenceThreshold: number;
  combinationThreshold: number;
  container: RefObject<HTMLElement | null>;
}

export interface CombinationActiveKey {
  pressedAt: number;
  releasedAt?: number;
}

export interface CombinationState {
  activeKeys: Map<Key, CombinationActiveKey>;
}

export type KeyChord = (Key | Key[])[];

export interface SequenceState {
  key: Key;
  chord: KeyChord;
  index: number;
  sequenceTimeout: ReturnType<typeof setTimeout> | null;
}

export type UseKeySchema = KeyEvent;

export type UseKeyCallback =
  | ((event: KeyboardEvent, key: Key, ...properties: unknown[]) => boolean)
  | ((event: KeyboardEvent, key: Key, ...properties: unknown[]) => void);

export type UseKeyOptions = Partial<KeyOptions>;
