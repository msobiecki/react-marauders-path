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
    ["W", "ArrowUp"],
    () => {
      inputReference.current.up = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    ["S", "ArrowDown"],
    () => {
      inputReference.current.down = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    ["A", "ArrowLeft"],
    () => {
      inputReference.current.left = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    ["D", "ArrowRight"],
    () => {
      inputReference.current.right = true;
      return true;
    },
    { eventType: "keydown", eventRepeat: false },
  );

  useKey(
    ["W", "ArrowUp"],
    () => {
      inputReference.current.up = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    ["S", "ArrowDown"],
    () => {
      inputReference.current.down = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    ["A", "ArrowLeft"],
    () => {
      inputReference.current.left = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    ["D", "ArrowRight"],
    () => {
      inputReference.current.right = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useKey(
    ["Space", "Enter"],
    () => {
      inputReference.current.enter = true;
      return true;
    },
    { eventType: "keydown" },
  );

  useKey(
    ["Space", "Enter"],
    () => {
      inputReference.current.enter = false;
      return true;
    },
    { eventType: "keyup" },
  );

  useWheel((event, data) => {
    event.preventDefault();
    scene.camera.addZoom(-data.deltaY * 0.001);
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
