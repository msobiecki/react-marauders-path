import { type Rect } from "../engine/types";

export type EnvironmentObject = Rect;

/**
 * Generate random environment objects (collision boxes)
 * @param count Number of objects
 * @param worldWidth Width of the world
 * @param worldHeight Height of the world
 * @param minSize Minimum width/height of a box
 * @param maxSize Maximum width/height of a box
 */
export const createEnvironment = (
  count: number,
  worldWidth: number,
  worldHeight: number,
  minSize: number,
  maxSize: number,
): EnvironmentObject[] => {
  const environment: EnvironmentObject[] = [];

  for (let index = 0; index < count; index += 1) {
    const w = minSize + Math.random() * (maxSize - minSize);
    const h = minSize + Math.random() * (maxSize - minSize);

    const x = Math.random() * (worldWidth - w);
    const y = Math.random() * (worldHeight - h);

    environment.push({ x, y, w, h });
  }

  return environment;
};
