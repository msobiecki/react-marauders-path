# react-marauders-path

[![License](https://img.shields.io/badge/license-%20%20GNU%20GPLv3%20-green.svg)](https://github.com/msobiecki/react-marauders-path/blob/master/LICENSE)

A lightweight, type-safe React library for handling keyboard, wheel, tap, double-tap, press, swipe, drag, and pinch events. Perfect for games, interactive applications, and input-driven interfaces.

![react-marauders-path](./docs/images/logotype.png)

## Features

- 🎮 **Keyboard Event Handling** - Detect single keys, key combinations, and sequences with configurable timing thresholds
- 🎡 **Wheel Event Handling** - Detect wheel delta values with optional `requestAnimationFrame` batching for smoother updates
- 👆 **Tap Gesture Handling** - Detect single taps/clicks with configurable movement and duration thresholds
- 👆👆 **Double-Tap Gesture Handling** - Detect consecutive taps/clicks with configurable timing and position thresholds
- ✋ **Press Gesture Handling** - Detect press-and-hold interactions with configurable delay and movement thresholds
- 🖐️ **Swipe Gesture Handling** - Detect directional swipes with configurable distance, velocity, and pointer type filtering
- ✊ **Drag Gesture Handling** - Detect movement, deltas, duration, and start/end positions with pointer type filtering and optional `requestAnimationFrame` batching
- 🤏 **Pinch Gesture Handling** - Detect two-finger distance, delta, and scale with pointer type filtering and optional `requestAnimationFrame` batching

## Installation

```bash
npm install @msobiecki/react-marauders-path
```

## Quick Start

### Key Event Hook

#### Single Key Pattern

```typescript
import { useKey } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useKey('a', (event, key) => {
    console.log(`Pressed ${key}`);
  });

  return <div>Press 'a'</div>;
}
```

#### Multiple Single Key Patterns

```typescript
useKey(["a", "b", "c"], (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Key Combination Pattern

```typescript
useKey("a+b", (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Multiple Key Combination Patterns

```typescript
useKey(["a+b", "c+d"], (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Key Sequence Pattern

```typescript
useKey("ArrowUp ArrowUp ArrowDown ArrowDown", (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Multiple Key Sequence Patterns

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
  useWheel((event, data) => {
    console.log(`Scrolled - X: ${data.deltaX}, Y: ${data.deltaY}`);
  });

  return <div>Scroll to interact</div>;
}
```

### Tap Event Hook

```typescript
import { useTap } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useTap((event, data) => {
    console.log(`Tapped at X: ${data.x}, Y: ${data.y}`);
  });

  return <div>Tap to interact</div>;
}
```

### Double Tap Event Hook

```typescript
import { useDoubleTap } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useDoubleTap((event, data) => {
    console.log(`Double tapped at X: ${data.x}, Y: ${data.y}`);
  });

  return <div>Double tap to interact</div>;
}
```

### Press Event Hook

```typescript
import { usePress } from '@msobiecki/react-marauders-path';

function MyComponent() {
  usePress((event, data) => {
    console.log(`Pressed at X: ${data.x}, Y: ${data.y}`);
  });

  return <div>Press and hold to interact</div>;
}
```

### Swipe Event Hook

```typescript
import { useSwipe } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useSwipe('left', (event, direction, data) => {
    console.log(`Swiped ${direction} with velocity ${data.velocity}`);
  });

  return <div>Swipe left</div>;
}
```

### Drag Event Hook

```typescript
import { useDrag } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useDrag((event, data) => {
    console.log(`Dragged by X: ${data.deltaX}, Y: ${data.deltaY}`);
  });

  return <div>Drag to interact</div>;
}
```

### Pinch Event Hook

```typescript
import { usePinch } from '@msobiecki/react-marauders-path';

function MyComponent() {
  usePinch((event, data) => {
    console.log(`Pinch scale: ${data.scale}, delta: ${data.delta}`);
  });

  return <div>Pinch to zoom</div>;
}
```

## API

### `useKey(keyEvent, callback, options?)`

Hook for keyboard event handling with support for single keys, combinations, and sequences.

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

- `callback: (event: WheelEvent, data: WheelData) => void | boolean` - Called when wheel event occurs
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

**Wheel Data:**

```typescript
interface WheelData {
  deltaX: number; // Delta X value
  deltaY: number; // Delta Y value
  deltaZ: number; // Delta Z value
  deltaMode: number; // Delta mode value
}
```

### `useTap(callback, options?)`

Hook for handling single tap/click interactions.

**Parameters:**

- `callback: (event: PointerEvent, data: TapData) => void | boolean` - Called when tap gesture is recognized
- `options?: UseTapOptions` - Optional configuration

**Options:**

```typescript
interface UseTapOptions {
  eventPointerTypes?: Array<"touch" | "mouse" | "pen">; // Default: ["touch", "mouse", "pen"]
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  threshold?: number; // Default: 8 (px) - Maximum movement allowed between pointerdown and pointerup
  maxDuration?: number; // Default: 250 (ms) - Maximum tap duration
  container?: RefObject<HTMLElement>; // Default: window
}
```

**Tap Data:**

```typescript
interface TapData {
  x: number; // Tap pointerup X
  y: number; // Tap pointerup Y
}
```

### `useDoubleTap(callback, options?)`

Hook for handling double-tap / double-click interactions.

**Parameters:**

- `callback: (event: PointerEvent, data: DoubleTapData) => void | boolean` - Called when double tap is recognized
- `options?: UseDoubleTapOptions` - Optional configuration

**Options:**

```typescript
interface UseDoubleTapOptions {
  eventPointerTypes?: Array<"touch" | "mouse" | "pen">; // Default: ["touch", "mouse", "pen"]
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  delay?: number; // Default: 300 (ms) - Maximum interval between taps
  threshold?: number; // Default: 8 (px) - Maximum distance between two tap positions
  container?: RefObject<HTMLElement>; // Default: window
}
```

**Double Tap Data:**

```typescript
interface DoubleTapData {
  x: number; // Tap pointerup X
  y: number; // Tap pointerup Y
}
```

### `usePress(callback, options?)`

Hook for handling press-and-hold interactions.

**Parameters:**

- `callback: (event: PointerEvent, data: PressData) => void | boolean` - Called when press delay completes
- `options?: UsePressOptions` - Optional configuration

**Options:**

```typescript
interface UsePressOptions {
  eventPointerTypes?: Array<"touch" | "mouse" | "pen">; // Default: ["touch", "mouse", "pen"]
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  delay?: number; // Default: 500 (ms) - Press-and-hold duration required
  threshold?: number; // Default: 8 (px) - Maximum movement allowed while holding
  container?: RefObject<HTMLElement>; // Default: window
}
```

**Press Data:**

```typescript
interface PressData {
  x: number; // Pointerdown X at press start
  y: number; // Pointerdown Y at press start
}
```

### `useSwipe(swipe, callback, options?)`

Hook for handling touch swipe gestures with configurable distance and velocity thresholds.

**Parameters:**

- `swipe: left | right | up | down | horizontal | vertical | both` - Allowed directions to listen
- `callback: (event: PointerEvent, direction: SwipeDirection, data: SwipeData) => void | boolean` - Called when a swipe event occurs
- `options?: UseSwipeOptions` - Optional configuration

**Options:**

```typescript
interface UseSwipeOptions {
  eventPointerTypes?: Array<"touch" | "mouse" | "pen">; // Default: ["touch", "mouse", "pen"]
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
  deltaX: number; // Horizontal travel
  deltaY: number; // Vertical travel
  velocity: number; // Average speed (distance / duration)
  duration: number; // Swipe duration in ms
}
```

### `useDrag(callback, options?)`

Hook for handling pointer drag gestures with configurable threshold and pointer types.

**Parameters:**

- `callback: (event: PointerEvent, data: DragData) => void | boolean` - Called when drag event occurs
- `options?: UseDragOptions` - Optional configuration

**Options:**

```typescript
interface UseDragOptions {
  eventPointerTypes?: Array<"touch" | "mouse" | "pen">; // Default: ["touch", "mouse", "pen"]
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  threshold?: number; // Default: 0 (px) - Minimum drag distance
  container?: RefObject<HTMLElement>; // Default: window
  raf?: boolean; // Default: false - Use requestAnimationFrame for batching
}
```

**Drag Data:**

```typescript
interface DragData {
  deltaX: number; // Horizontal movement from drag start
  deltaY: number; // Vertical movement from drag start
  movementX: number; // Horizontal movement from previous drag event
  movementY: number; // Vertical movement from previous drag event
  duration: number; // Drag duration in ms
  startX: number; // Drag start X
  startY: number; // Drag start Y
  endX: number; // Drag end X
  endY: number; // Drag end Y
}
```

### `usePinch(callback, options?)`

Hook for handling two-pointer pinch gestures with distance and scale tracking.

**Parameters:**

- `callback: (event: PointerEvent, data: PinchData) => void | boolean` - Called when pinch event occurs
- `options?: UsePinchOptions` - Optional configuration

**Options:**

```typescript
interface UsePinchOptions {
  eventPointerTypes?: Array<"touch" | "mouse" | "pen">; // Default: ["touch"]
  eventCapture?: boolean; // Default: false
  eventOnce?: boolean; // Default: false
  eventStopImmediatePropagation?: boolean; // Default: false
  threshold?: number; // Default: 0 (px) - Minimum pinch distance change
  container?: RefObject<HTMLElement>; // Default: window
  raf?: boolean; // Default: false - Use requestAnimationFrame for batching
}
```

**Pinch Data:**

```typescript
interface PinchData {
  distance: number; // Current distance between active pointers
  delta: number; // Distance change since previous pinch update
  totalDelta: number; // Distance change since pinch start
  scale: number; // Current scale ratio (distance / startDistance)
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
npm run lint
```

## Project Status

### High-level Gesture Hook

- 🚧 **`useGesture`** – high-level API for gesture handling  
  Supported gestures:
  - `tap` – single tap / click
  - `doubleTap` – quick double tap
  - `press` / `longPress` – press and hold
  - `swipe` – directional swipe
  - `drag` / `pan` – track movement of finger or mouse
  - `pinch` / `zoom` – two-finger pinch / zoom

### Pointer / Mouse Hooks (Unified)

- 🚧 **`usePointer`** – unified hook for MouseEvent, PointerEvent, and TouchEvent  
  Supported events:
  - `pointerdown`, `pointermove`, `pointerup`, `pointerenter`, `pointerleave`, `pointercancel`  
    Filter by pointer type: `mouse` | `touch` | `pen`  
    Callback returns unified data e.g.: `x`, `y`, `button`, `type`, `isPrimary`

- 🚧 **`useMouse`** – alias for `usePointer` filtered to mouse only  
  Supported events:
  - `mousemove`, `mousedown`, `mouseup`, `click`, `dblclick`  
    Buttons: `left`, `right`, `middle`

## License

See [LICENSE](./LICENSE) file for details.
