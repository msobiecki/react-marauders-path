import { Camera } from "../engine/camera";

import { Player } from "./player";
import { createEnvironment, type EnvironmentObject } from "./environment";
import { createCampfire, type Campfire } from "./campfire";

export class GameScene {
  worldWidth: number;
  worldHeight: number;
  environment: EnvironmentObject[];
  player: Player;
  camera: Camera;
  campfire: Campfire;

  win = false;
  time = 0;

  constructor(
    worldWidth: number,
    worldHeight: number,
    worldEnvironmentObjects: number,
  ) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.environment = createEnvironment(
      worldEnvironmentObjects,
      worldWidth,
      worldHeight,
      20,
      80,
    );

    this.player = new Player(worldWidth, worldHeight, this.environment);

    this.campfire = createCampfire(worldWidth, worldHeight, this.environment);

    this.camera = new Camera(worldWidth, worldHeight);
  }

  update(
    delta: number,
    input: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
      enter?: boolean;
    },
  ) {
    this.player.update(
      delta,
      input,
      this.environment,
      this.worldWidth,
      this.worldHeight,
    );

    if (
      input.enter &&
      this.player.position.x < this.campfire.x + this.campfire.w &&
      this.player.position.x + this.player.size > this.campfire.x &&
      this.player.position.y < this.campfire.y + this.campfire.h &&
      this.player.position.y + this.player.size > this.campfire.y
    ) {
      this.win = true;
    }
  }

  render(context: CanvasRenderingContext2D, width: number, height: number) {
    this.camera.follow(
      this.player.position.x,
      this.player.position.y,
      width,
      height,
    );

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#1a1a1a";
    context.fillRect(0, 0, width, height);

    context.fillStyle = "#2e8b57";
    this.environment.forEach((object) => {
      context.fillRect(
        object.x - this.camera.x,
        object.y - this.camera.y,
        object.w,
        object.h,
      );
    });

    const centerX = this.campfire.x + this.campfire.w / 2 - this.camera.x;
    const centerY = this.campfire.y + this.campfire.h / 2 - this.camera.y;

    const pulse = 10 + Math.sin(this.time * 4) * 5;

    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      5,
      centerX,
      centerY,
      30 + pulse,
    );

    gradient.addColorStop(0, "rgba(255,200,50,0.9)");
    gradient.addColorStop(0.4, "rgba(255,120,0,0.6)");
    gradient.addColorStop(1, "rgba(255,50,0,0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(centerX, centerY, 30 + pulse, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = this.win ? "gold" : "orange";
    context.fillRect(
      this.campfire.x - this.camera.x,
      this.campfire.y - this.camera.y,
      this.campfire.w,
      this.campfire.h,
    );

    context.fillStyle = "red";
    context.fillRect(
      this.player.position.x - this.camera.x,
      this.player.position.y - this.camera.y,
      this.player.size,
      this.player.size,
    );

    const margin = 40;
    context.textAlign = "center";
    context.textBaseline = "bottom";

    if (!this.win) {
      context.fillStyle = "white";
      context.font = "24px sans-serif";

      context.fillText("Move with Arrow Keys", width / 2, height - margin - 60);
      context.fillText("Find the campfire 🔥", width / 2, height - margin - 30);
      context.fillText("Press ENTER to light it", width / 2, height - margin);
    }

    if (this.win) {
      context.fillStyle = "gold";
      context.font = "48px sans-serif";
      context.fillText("🔥 YOU WIN 🔥", width / 2, height - margin);
    }
  }
}
