import { useMemo, useRef } from "react";
import { useKey, useWheel } from "@msobiecki/react-marauders-path";

import Canvas from "../engine/Canvas";
import useGameLoop from "../engine/use-game-loop";

import { GameScene } from "./game-scene";

const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const WORLD_ENVIRONMENT_OBJECTS = 500;

const Game = () => {
  const scene = useMemo(
    () => new GameScene(WORLD_WIDTH, WORLD_HEIGHT, WORLD_ENVIRONMENT_OBJECTS),
    [],
  );

  const inputReference = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    enter: false,
  });

  useKey(
    "ArrowUp",
    () => {
      inputReference.current.up = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    "ArrowDown",
    () => {
      inputReference.current.down = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    "ArrowLeft",
    () => {
      inputReference.current.left = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    "ArrowRight",
    () => {
      inputReference.current.right = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    "ArrowUp",
    () => {
      inputReference.current.up = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    "ArrowDown",
    () => {
      inputReference.current.down = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    "ArrowLeft",
    () => {
      inputReference.current.left = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    "ArrowRight",
    () => {
      inputReference.current.right = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    "Enter",
    () => {
      inputReference.current.enter = true;
      return true;
    },
    { eventType: "keydown" },
  );

  useKey(
    "Enter",
    () => {
      inputReference.current.enter = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useWheel((event, delta) => {
    event.preventDefault();
    scene.camera.addZoom(-delta.y * 0.001);
  });

  useGameLoop((delta) => {
    scene.update(delta, inputReference.current);
  });

  return (
    <Canvas
      render={(context, width, height) => scene.render(context, width, height)}
    />
  );
};

export default Game;
