# react-marauders-path

![react-marauders-path](./docs/images/logotype.png)

A lightweight, type-safe React library for handling keyboard events. Perfect for games, interactive applications, and keyboard-driven interfaces.

## Features

- 🎮 **Keyboard Event Handling** - Simple API for detecting single keys, key combinations, and sequences

## Installation

```bash
npm install @msobiecki/react-marauders-path
```

## Quick Start

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

### Multiple Patterns of Single Key Schema

```typescript
// Listen to multiple key patterns
useKey(["a", "b", "c"], (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Combination Key Schema

```typescript
// Listen for simultaneous key press (a + b pressed together within 500ms)
useKey("a+b", (event, key) => {
  console.log(`Pressed ${key}`);
});
```

### Multiple Patterns of Combination Key Schema

```typescript
// Listen for multiple combination patterns
useKey(["a+b", "c+d"], (event, key) => {
  console.log(`Pressed ${key}`);
});
```

### Sequential Key Schema

```typescript
// Listen for Konami code
useKey("ArrowUp ArrowUp ArrowDown ArrowDown", (event, key) => {
  console.log(`Pressed ${key}`);
});
```

#### Multiple Patterns of Sequential Key Schema

```typescript
// Listen for multiple sequences
useKey(
  ["ArrowUp ArrowUp ArrowDown ArrowDown", "ArrowLeft ArrowRight"],
  (event, key) => {
    console.log(`Pressed ${key}`);
  },
);
```

## API

### `useKey(keyEvent, callback, options?)`

Main hook for keyboard event handling.

**Parameters:**

- `keyEvent: string | string[]` - Single key, combination, or sequence to listen for
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
  combinationThreshold?: number; // Default: 500 (ms) - Timeout between combination keys
  container?: RefObject<HTMLElement>; // Default: window
}
```

### `useKeyOnce(keyEvent, callback, options?)`

One-time keyboard event listener. Automatically removes after first trigger.

**Parameters:** Same as `useKey`

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

- Real-time keyboard input handling with arrow keys
- Sequential key patterns (e.g., Konami code)
- Combination keys (simultaneous key presses)
- Game collision detection and movement

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

- 🚧 Core `useKey` combination sequence pattern
- 🚧 Core `useMouse` hook
- 🚧 Core `useMouse` hook unit test coverage
- 🚧 Example of usage

## License

See [LICENSE](./LICENSE) file for details.
