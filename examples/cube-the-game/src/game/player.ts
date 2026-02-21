import { type Rect, type Vector2 } from "../engine/types";

function isColliding(
  x: number,
  y: number,
  size: number,
  environment: Rect[],
): boolean {
  return environment.some(
    (object) =>
      x < object.x + object.w &&
      x + size > object.x &&
      y < object.y + object.h &&
      y + size > object.y,
  );
}

export function findSafeSpawn(
  worldWidth: number,
  worldHeight: number,
  playerSize: number,
  environment: Rect[],
): Vector2 {
  while (true) {
    const x = Math.random() * (worldWidth - playerSize);
    const y = Math.random() * (worldHeight - playerSize);

    if (!isColliding(x, y, playerSize, environment)) {
      return { x, y };
    }
  }
}

export class Player {
  position: Vector2;
  size = 32;
  speed = 200;

  constructor(worldWidth: number, worldHeight: number, environment: Rect[]) {
    this.position = findSafeSpawn(
      worldWidth,
      worldHeight,
      this.size,
      environment,
    );
  }

  update(
    delta: number,
    input: { up: boolean; down: boolean; left: boolean; right: boolean },
    environment: Rect[],
    worldWidth: number,
    worldHeight: number,
  ) {
    let dx = 0;
    let dy = 0;

    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;
    }

    const moveX = dx * this.speed * delta;
    const moveY = dy * this.speed * delta;

    const nextX = this.position.x + moveX;
    if (!isColliding(nextX, this.position.y, this.size, environment)) {
      this.position.x = nextX;
    }

    const nextY = this.position.y + moveY;
    if (!isColliding(this.position.x, nextY, this.size, environment)) {
      this.position.y = nextY;
    }

    this.position.x = Math.max(
      0,
      Math.min(worldWidth - this.size, this.position.x),
    );
    this.position.y = Math.max(
      0,
      Math.min(worldHeight - this.size, this.position.y),
    );
  }
}
