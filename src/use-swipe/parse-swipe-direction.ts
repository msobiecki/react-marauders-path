import { SwipeDirection } from "./use-swipe.types";

/**
 * Parses the swipe direction schema into an array of swipe directions.
 *
 * Converts a single SwipeDirection or an array of SwipeDirections into a consistent array format.
 * This allows the useSwipe hook to uniformly handle both single and multiple direction schemas.
 *
 * @param {SwipeDirection | SwipeDirection[]} input - The swipe direction(s) to parse
 * @returns {SwipeDirection[]} An array of swipe directions
 *
 * @example
 * parseSwipeDirection('left')         // ['left']
 * parseSwipeDirection(['left', 'up']) // ['left', 'up']
 */
export const parseSwipeDirection = (
  input: SwipeDirection | SwipeDirection[],
): SwipeDirection[] => {
  return Array.isArray(input) ? input : [input];
};
