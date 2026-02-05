import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { SequenceState } from "./use-key.types";

import { resetSequenceState, advanceSequenceState } from "./sequence-state";

describe("resetSequenceState", () => {
  let mockSequences: SequenceState[];

  beforeEach(() => {
    vi.useFakeTimers();
    mockSequences = [
      { key: "a", chord: ["a"], index: 1, timeout: null },
      { key: "b", chord: ["b"], index: 2, timeout: null },
      { key: "c", chord: ["c"], index: 3, timeout: null },
    ];
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should reset the index to 0", () => {
    const sequence = mockSequences[0];
    const result = resetSequenceState(sequence, mockSequences);
    expect(result[0].index).toBe(0);
  });

  it("should reset the timeout to null", () => {
    const sequence = mockSequences[0];
    const mockTimeout = setTimeout(() => {
      /* no-op */
    }, 1000) as unknown as ReturnType<typeof setTimeout>;
    sequence.timeout = mockTimeout;

    const result = resetSequenceState(sequence, mockSequences);
    expect(result[0].timeout).toBe(null);
  });

  it("should clear existing timeout", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const mockTimeout = setTimeout(() => {
      /* no-op */
    }, 1000) as unknown as ReturnType<typeof setTimeout>;
    const sequence = mockSequences[0];
    sequence.timeout = mockTimeout;

    resetSequenceState(sequence, mockSequences);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(mockTimeout);
  });

  it("should preserve other sequences in the array", () => {
    const sequence = mockSequences[0];
    const result = resetSequenceState(sequence, mockSequences);
    expect(result).toHaveLength(3);
    expect(result[1].index).toBe(2);
    expect(result[2].index).toBe(3);
  });

  it("should only reset the matched sequence", () => {
    const sequence = mockSequences[1];
    const result = resetSequenceState(sequence, mockSequences);
    expect(result[0].index).toBe(1);
    expect(result[1].index).toBe(0);
    expect(result[2].index).toBe(3);
  });

  it("should return a new array", () => {
    const sequence = mockSequences[0];
    const result = resetSequenceState(sequence, mockSequences);
    expect(result).not.toBe(mockSequences);
  });

  it("should handle sequence with null timeout", () => {
    const sequence = mockSequences[0];
    sequence.timeout = null;
    expect(() => {
      resetSequenceState(sequence, mockSequences);
    }).not.toThrow();
  });

  it("should create new objects for modified sequence", () => {
    const sequence = mockSequences[0];
    const result = resetSequenceState(sequence, mockSequences);
    expect(result[0]).not.toBe(sequence);
    expect(result[0].key).toBe(sequence.key);
  });
});

describe("advanceSequenceState", () => {
  let mockSequences: SequenceState[];
  let mockOnTimeout: (sequence: SequenceState) => void;

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnTimeout = vi.fn();
    mockSequences = [
      { key: "a", chord: ["a"], index: 0, timeout: null },
      { key: "b", chord: ["b"], index: 1, timeout: null },
      { key: "c", chord: ["c"], index: 2, timeout: null },
    ];
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should advance the sequence index by 1", () => {
    const sequence = mockSequences[0];
    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(nextSequence.index).toBe(1);
  });

  it("should return updated sequences array", () => {
    const sequence = mockSequences[0];
    const [, newSequences] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(newSequences).toHaveLength(3);
    expect(newSequences[0].index).toBe(1);
  });

  it("should preserve other sequences in the array", () => {
    const sequence = mockSequences[0];
    const [, newSequences] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(newSequences[1].index).toBe(1);
    expect(newSequences[2].index).toBe(2);
  });

  it("should not set timeout when timeoutMs is undefined", () => {
    const sequence = mockSequences[0];
    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(nextSequence.timeout).toBe(null);
  });

  it("should set timeout when timeoutMs is provided", () => {
    const sequence = mockSequences[0];
    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      1000,
      mockOnTimeout,
    );
    expect(nextSequence.timeout).not.toBe(null);
  });

  it("should call onTimeout after specified timeout duration", () => {
    const sequence = mockSequences[0];
    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      1000,
      mockOnTimeout,
    );
    vi.advanceTimersByTime(1000);
    expect(mockOnTimeout).toHaveBeenCalledWith(nextSequence);
  });

  it("should clear previous timeout before setting new one", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const previousTimeout = setTimeout(() => {
      /* no-op */
    }, 500) as unknown as ReturnType<typeof setTimeout>;
    const sequence = mockSequences[0];
    sequence.timeout = previousTimeout;

    advanceSequenceState(sequence, mockSequences, 1000, mockOnTimeout);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(previousTimeout);
  });

  it("should handle sequence with existing timeout", () => {
    const previousTimeout = setTimeout(() => {
      /* no-op */
    }, 500) as unknown as ReturnType<typeof setTimeout>;
    const sequence = mockSequences[0];
    sequence.timeout = previousTimeout;

    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      1000,
      mockOnTimeout,
    );
    expect(nextSequence.timeout).not.toBeNull();
  });

  it("should return new sequence objects", () => {
    const sequence = mockSequences[0];
    const [nextSequence, newSequences] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(nextSequence).not.toBe(sequence);
    expect(newSequences[0]).not.toBe(sequence);
  });

  it("should maintain key and chord properties", () => {
    const sequence = mockSequences[0];
    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(nextSequence.key).toBe(sequence.key);
    expect(nextSequence.chord).toBe(sequence.chord);
  });

  it("should handle multiple advances", () => {
    let sequence = mockSequences[0];
    let sequences = mockSequences;

    [sequence, sequences] = advanceSequenceState(
      sequence,
      sequences,
      undefined,
      mockOnTimeout,
    );
    expect(sequence.index).toBe(1);

    [sequence, sequences] = advanceSequenceState(
      sequence,
      sequences,
      undefined,
      mockOnTimeout,
    );
    expect(sequence.index).toBe(2);

    [sequence, sequences] = advanceSequenceState(
      sequence,
      sequences,
      undefined,
      mockOnTimeout,
    );
    expect(sequence.index).toBe(3);
  });

  it("should not set timeout if timeoutMs is 0", () => {
    const sequence = mockSequences[0];
    const [nextSequence] = advanceSequenceState(
      sequence,
      mockSequences,
      0,
      mockOnTimeout,
    );

    expect(nextSequence.timeout).toBe(null);
    vi.advanceTimersByTime(0);
    expect(mockOnTimeout).not.toHaveBeenCalled();
  });

  it("should only advance the correct sequence in a multi-sequence array", () => {
    const sequence = mockSequences[1];
    const [, newSequences] = advanceSequenceState(
      sequence,
      mockSequences,
      undefined,
      mockOnTimeout,
    );
    expect(newSequences[0].index).toBe(0);
    expect(newSequences[1].index).toBe(2);
    expect(newSequences[2].index).toBe(2);
  });
});
