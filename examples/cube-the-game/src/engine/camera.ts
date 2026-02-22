export class Camera {
  x = 0;
  y = 0;
  zoom = 1;
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
    const scaledWidth = viewportWidth / this.zoom;
    const scaledHeight = viewportHeight / this.zoom;

    this.x = targetX - scaledWidth / 2;
    this.y = targetY - scaledHeight / 2;

    this.x = Math.max(0, Math.min(this.worldWidth - scaledWidth, this.x));
    this.y = Math.max(0, Math.min(this.worldHeight - scaledHeight, this.y));
  }

  setZoom(zoomLevel: number) {
    this.zoom = Math.max(0.5, Math.min(3, zoomLevel));
  }

  addZoom(delta: number) {
    this.setZoom(this.zoom + delta);
  }
}
