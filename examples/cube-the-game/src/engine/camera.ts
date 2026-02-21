export class Camera {
  x = 0;
  y = 0;
  private worldWidth: number;
  private worldHeight: number;

  constructor(worldWidth: number, worldHeight: number) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  follow(
    targetX: number,
    targetY: number,
    viewportWidth: number,
    viewportHeight: number,
  ) {
    this.x = targetX - viewportWidth / 2;
    this.y = targetY - viewportHeight / 2;

    this.x = Math.max(0, Math.min(this.worldWidth - viewportWidth, this.x));
    this.y = Math.max(0, Math.min(this.worldHeight - viewportHeight, this.y));
  }
}
