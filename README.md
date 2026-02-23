# react-marauders-path

[![License](https://img.shields.io/badge/license-%20%20GNU%20GPLv3%20-green.svg)](https://github.com/msobiecki/react-marauders-path/blob/master/LICENSE)

A lightweight, type-safe React library for handling keyboard, wheel, and swipe events. Perfect for games, interactive applications, and input-driven interfaces.

![react-marauders-path](./docs/images/logotype.png)

## Features

- 🎮 **Keyboard Event Handling** - Simple API for detecting single keys, key combinations, and sequences
- 🎡 **Wheel Event Handling** - Mouse wheel scrolling with delta tracking and batching support
- 🖐️ **Swipe Gesture Handling** - Touch swipe detection with distance and velocity thresholds

## Installation

```bash
npm install @msobiecki/react-marauders-path
```

## Quick Start

### Key Event Hook

#### Single Key Schema

```typescript
import { useKey } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useKey('a', (event, key) => {
    console.log(`Pressed ${key}`);
  });

  return <div>Press 'a'</div>;
}
```

#### Multiple Patterns of Single Key Schema

```typescript
useKey(["a", "b", "c"], (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Combination Key Schema

```typescript
useKey("a+b", (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Multiple Patterns of Combination Key Schema

```typescript
useKey(["a+b", "c+d"], (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Sequential Key Schema

```typescript
useKey("ArrowUp ArrowUp ArrowDown ArrowDown", (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Multiple Patterns of Sequential Key Schema

```typescript
useKey(
  ["ArrowUp ArrowUp ArrowDown ArrowDown", "ArrowLeft ArrowRight"],
  (event, key) => {
    console.log(`Pressed ${key}`);
  },
);
```

### Wheel Event Hook

```typescript
import { useWheel } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useWheel((event, delta) => {
    console.log(`Scrolled - X: ${delta.x}, Y: ${delta.y}`);
  });

  return <div>Scroll to interact</div>;
}
```

### Swipe Event Hook

```typescript
import { useSwipe } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useSwipe('left' (event, swipe) => {
    console.log(`Swiped ${swipe.direction} with velocity ${swipe.velocity}`);
  });

  return <div>Swipe left</div>;
}
```

## API

### `useKey(keyEvent, callback, options?)`

Main hook for keyboard event handling.

**Parameters:**

- `keyEvent: string | string[]` - Single key, combination, or sequence to listen
- `callback: (event: KeyboardEvent, key: string) => void | boolean` - Called when key event occurs
- `options?: UseKeyOptions` - Optional configuration

**Options:**

```typescript
interface UseKeyOptions {
  eventType?: "keyup" | "keydown"; // Default: 'keyup'
  eventRepeat?: boolean; // Default: false
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  sequenceThreshold?: number; // Default: 1000 (ms) - Timeout between sequence keys
  combinationThreshold?: number; // Default: 200 (ms) - Timeout between combination keys
  container?: RefObject<HTMLElement>; // Default: window
}
```

### `useWheel(callback, options?)`

Hook for handling mouse wheel events with support for different delta modes and options.

**Parameters:**

- `callback: (event: WheelEvent, delta: WheelData) => void | boolean` - Called when wheel event occurs
- `options?: UseWheelOptions` - Optional configuration

**Options:**

```typescript
interface UseWheelOptions {
  eventPassive?: boolean; // Default: true
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  container?: RefObject<HTMLElement>; // Default: window
  raf?: boolean; // Default: false - Use requestAnimationFrame for batching
}
```

**Delta Data:**

```typescript
interface WheelData {
  x: number; // Delta X value
  y: number; // Delta Y value
  z: number; // Delta Z value
  deltaMode: number; // Delta mode value
}
```

### `useSwipe(swipe, callback, options?)`

Hook for handling touch swipe gestures with configurable distance and velocity thresholds.

**Parameters:**

- `swipe: left | right | up | down | horizontal | vertical | both` - Allowed directions to listen
- `callback: (event: TouchEvent, data: SwipeData) => void | boolean` - Called when a swipe event occurs
- `options?: UseSwipeOptions` - Optional configuration

**Options:**

```typescript
interface UseSwipeOptions {
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  threshold?: number; // Default: 50 (px) - Minimum travel distance
  velocity?: number; // Default: 0.3 (px/ms) - Minimum average speed
  container?: RefObject<HTMLElement>; // Default: window
}
```

**Swipe Data:**

```typescript
interface SwipeData {
  direction: SwipeDirection; // Resolved direction
  deltaX: number; // Horizontal travel
  deltaY: number; // Vertical travel
  velocity: number; // Average speed (distance / duration)
  duration: number; // Swipe duration in ms
}
```

## Advanced Examples

### Using Options for Event Type and Propagation Control

```typescript
useKey(
  "Enter",
  (event, key) => {
    handleSubmit();
  },
  {
    eventType: "keydown",
    eventStopImmediatePropagation: true,
    container: inputRef,
  },
);
```

### Listening for Key Repeat

```typescript
// Allow repeated key presses to trigger callback (useful for games)
useKey(
  "ArrowUp",
  (event, key) => {
    moveUp();
  },
  {
    eventType: "keydown",
    eventRepeat: true,
  },
);
```

### Custom Thresholds for Sequences and Combinations

```typescript
// Increase threshold for slower typists
useKey(
  "a b c",
  (event, key) => {
    console.log(`Sequence: ${key}`);
  },
  {
    sequenceThreshold: 2000, // 2 seconds between keys
  },
);

// Increase threshold for combination keys
useKey(
  "a+b",
  (event, key) => {
    console.log(`Combination: ${key}`);
  },
  {
    combinationThreshold: 1000, // 1 second window for simultaneous press
  },
);
```

## Examples

### Game Controls

See the [Cube Game Example](./examples/cube-the-game/) for a full implementation:

```bash
cd examples/cube-the-game
npm install
npm run dev
```

This example demonstrates:

- Combined mouse, touch, and keyboard input

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Lint

```bash
npm lint
```

## Project Status

Hooks

- 🚧 `useMouse` – Mouse interaction handling
- 🚧 `useMouse` – Unit test coverage
- 🚧 `useTouch` – Touch interaction handling
- 🚧 `useTouch` – Unit test coverage
- 🚧 `useInteraction` – Unified mouse, touch, and keyboard interaction handling
- 🚧 `useInteraction` – Unit test coverage

## License

See [LICENSE](./LICENSE) file for details.
