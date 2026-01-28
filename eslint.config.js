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
  reactPreset,
  importPreset,
  {
    files: ["vite.config.ts"],
    extends: [nodePreset],
  },
  {
    rules: {
      "security/detect-object-injection": "off",
      "unicorn/no-null": "off",
    },
  },
]);
