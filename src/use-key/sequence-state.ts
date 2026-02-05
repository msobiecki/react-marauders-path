import type { SequenceState } from "./use-key.types";

export const resetSequenceState = (
  sequence: SequenceState,
  sequences: SequenceState[],
): SequenceState[] => {
  const reset = { ...sequence, index: 0, timeout: null };

  if (sequence.timeout) {
    clearTimeout(sequence.timeout);
  }

  return sequences.map((candidateSequence) =>
    candidateSequence === sequence ? reset : candidateSequence,
  );
};

export const advanceSequenceState = (
  sequence: SequenceState,
  sequences: SequenceState[],
  timeoutMs: number | undefined,
  onTimeout: (sequence: SequenceState) => void,
): [SequenceState, SequenceState[]] => {
  const nextSequence: SequenceState = {
    ...sequence,
    index: sequence.index + 1,
    timeout: sequence.timeout,
  };

  if (timeoutMs) {
    if (nextSequence.timeout) {
      clearTimeout(nextSequence.timeout);
    }
    nextSequence.timeout = setTimeout(() => onTimeout(nextSequence), timeoutMs);
  }

  const newSequences = sequences.map((candidateSequence) =>
    candidateSequence === sequence ? nextSequence : candidateSequence,
  );

  return [nextSequence, newSequences];
};
