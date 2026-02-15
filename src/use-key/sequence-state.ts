import { SequenceState } from "./use-key.types";

/**
 * Resets a sequence state to its initial values.
 *
 * Sets index to 0, clears any pending timeout, and returns a new array
 * with the reset sequence while preserving other sequences.
 *
 * @param {SequenceState} sequence - The sequence to reset
 * @param {SequenceState[]} sequences - The full sequences array
 * @returns {SequenceState[]} New array with the reset sequence
 *
 * @example
 * const sequences = [{ key: 'a', index: 2, sequenceTimeout: id1, ... }];
 * const reset = resetSequenceState(sequences[0], sequences);
 * // reset[0].index === 0 && reset[0].sequenceTimeout === null
 */
export const resetSequenceState = (
  sequence: SequenceState,
  sequences: SequenceState[],
): SequenceState[] => {
  const reset = { ...sequence, index: 0, sequenceTimeout: null };

  if (sequence.sequenceTimeout) {
    clearTimeout(sequence.sequenceTimeout);
  }

  return sequences.map((candidateSequence) =>
    candidateSequence === sequence ? reset : candidateSequence,
  );
};

/**
 * Advances a sequence state to the next key in the sequence.
 *
 * Increments the sequence index and optionally sets a timeout for sequence completion.
 * Clears any existing timeout before setting a new one.
 *
 * @param {SequenceState} sequence - The sequence to advance
 * @param {SequenceState[]} sequences - The full sequences array
 * @param {number|undefined} timeout - Timeout duration in milliseconds (falsy = no timeout)
 * @param {Function} onTimeout - Callback invoked when timeout expires
 * @returns {[SequenceState, SequenceState[]]} Tuple of advanced sequence and updated sequences array
 *
 * @example
 * const [nextSeq, newSeqs] = advanceSequenceState(
 *   sequence,
 *   sequences,
 *   3000,
 *   (seq) => console.log('Sequence timed out')
 * );
 * // nextSeq.index === sequence.index + 1
 */
export const advanceSequenceState = (
  sequence: SequenceState,
  sequences: SequenceState[],
  timeout: number | undefined,
  onTimeout: (sequence: SequenceState) => void,
): [SequenceState, SequenceState[]] => {
  const nextSequence: SequenceState = {
    ...sequence,
    index: sequence.index + 1,
    sequenceTimeout: sequence.sequenceTimeout,
  };

  if (timeout) {
    if (nextSequence.sequenceTimeout) {
      clearTimeout(nextSequence.sequenceTimeout);
    }
    nextSequence.sequenceTimeout = setTimeout(
      () => onTimeout(nextSequence),
      timeout,
    );
  }

  const newSequences = sequences.map((candidateSequence) =>
    candidateSequence === sequence ? nextSequence : candidateSequence,
  );

  return [nextSequence, newSequences];
};
