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

### Basic Key Detection

```typescript
import { useKey } from '@msobiecki/react-marauders-path';

function MyComponent() {
  useKey('ArrowUp', (event) => {
    console.log('ArrowUp pressed');
  });

  return <div>Press arrow up</div>;
}
```

### Key Combinations

```typescript
// Listen for simultaneous key press (Control + a)
useKey("Control+a", (event) => {
  console.log("Control and a pressed together");
});
```

### Key Sequences

```typescript
// Listen for key sequence (a then b)
useKey(["a", "b"], (event) => {
  console.log("a then b pressed in sequence");
});
```

### Multiple Keys

```typescript
// Listen to multiple key patterns
useKey(["ArrowUp", "w"], (event) => {
  console.log("Either ArrowUp or W pressed");
});
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
  sequenceTimeout?: number; // Default: 1000 (ms)
  container?: RefObject<HTMLElement>; // Default: window
}
```

### `useKeyOnce(keyEvent, callback, options?)`

One-time keyboard event listener. Automatically removes after first trigger.

**Parameters:** Same as `useKey`

## Examples

### Game Controls

See the [Cube Game Example](./examples/cube-the-game/) for a full implementation:

```bash
cd examples/cube-the-game
npm install
npm run dev
```

This example demonstrates:

- Real-time keyboard input handling

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

- 🚧 Core `useKey` hook combinations support
- 🚧 `useKey` hook combinations unit test coverage
- 🚧 Core `useMouse` hook
- 🚧 Core `useMouse` hook unit test coverage
- 🚧 Example of usage

## License

See [LICENSE](./LICENSE) file for details.
