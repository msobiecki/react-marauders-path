import { defineConfig } from "eslint/config";
import {
  basePreset,
  bestPracticePreset,
  reactPreset,
  importPreset,
  nodePreset,
} from "@msobiecki/eslint-config";

export default defineConfig([
  basePreset,
  bestPracticePreset,
  importPreset,
  {
    files: ["vite.config.ts"],
    extends: [nodePreset],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.node.json",
      },
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [reactPreset],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.app.json",
      },
    },
  },
  {
    rules: {
      "security/detect-object-injection": "off",
      "unicorn/no-null": "off",
    },
  },
]);
