import { describe, it, expect } from "vitest";

import { parseSwipeDirection } from "./parse-swipe-direction";
import { SwipeDirections } from "./use-swipe.types";

describe("parseSwipeDirection", () => {
  it("should parse a single direction", () => {
    const result = parseSwipeDirection(SwipeDirections.Left);

    expect(result).toEqual([SwipeDirections.Left]);
  });

  it("should parse array of a single direction", () => {
    const input = [SwipeDirections.Up];

    const result = parseSwipeDirection(input);

    expect(result).toBe(input);
  });

  it("should parse array of multiple directions", () => {
    const input = [
      SwipeDirections.Right,
      SwipeDirections.Vertical,
      SwipeDirections.Both,
    ];

    const result = parseSwipeDirection(input);

    expect(result).toEqual([
      SwipeDirections.Right,
      SwipeDirections.Vertical,
      SwipeDirections.Both,
    ]);
  });
});
