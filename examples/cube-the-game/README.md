# Cube: The Game

## Overview
Cube: The Game is a top-down 2D canvas game built with React, Vite, and TypeScript. You explore a procedurally sprinkled world, find the campfire, and light it to win. The loop, camera, and input are handled via `@msobiecki/react-marauders-path` utilities and a lightweight canvas renderer.

## How to Play
- Move with the arrow keys to explore the world.
- Find the campfire; when you overlap it, press Enter to light it.
- Once lit, you win. Reload to play again.

## Controls
- Arrow keys: Move up, down, left, right
- Enter: Light the campfire when overlapping

## Features
- Camera follows the player across a large world (1000x1000 units by default).
- Procedural environment objects to navigate around.
- Custom game loop hook driving updates and rendering.
- Canvas renderer for the world and on-screen hints.

## Tech Stack
- React 19
- Vite 7 (dev server, bundling, preview)
- TypeScript 5

## Getting Started
1. Install dependencies:
	```bash
	npm install
	```
2. Run the dev server:
	```bash
	npm run dev
	```
	Vite prints the local URL (typically http://localhost:5173).
3. Open the URL in your browser and play.

## Available Scripts
- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Project Structure
- `src/main.tsx` — app entry, renders `Game`
- `src/game/Game.tsx` — input wiring, game loop, canvas renderer
- `src/game/game-scene.ts` — world state, updates, and rendering logic
- `src/game` — player, environment, campfire definitions
- `src/engine` — canvas wrapper, camera, game loop hook

## Notes
- World size, object count, and other constants live in `Game.tsx` and `game-scene.ts`. Adjust to tweak difficulty or density.
- The game uses arrow keys and Enter by design; add bindings via the `useKey` hooks in `Game.tsx` if needed.