import { type Rect } from "../engine/types";

export interface Campfire extends Rect {
  active?: boolean;
}

export function createCampfire(
  worldWidth: number,
  worldHeight: number,
  environment: Rect[],
): Campfire {
  while (true) {
    const size = 32;
    const x = Math.random() * (worldWidth - size);
    const y = Math.random() * (worldHeight - size);

    const collision = environment.some(
      (object) =>
        x < object.x + object.w &&
        x + size > object.x &&
        y < object.y + object.h &&
        y + size > object.y,
    );

    if (!collision) {
      return { x, y, w: size, h: size, active: true };
    }
  }
}
