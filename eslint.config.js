import { defineConfig } from "eslint/config";
import {
  basePreset,
  bestPracticePreset,
  reactPreset,
  importPreset,
  nodePreset,
  vitestPreset,
} from "@msobiecki/eslint-config";

export default defineConfig([
  {
    ignores: ["examples/**"],
  },
  basePreset,
  bestPracticePreset,
  reactPreset,
  importPreset,
  vitestPreset,
  {
    files: ["vite.config.ts"],
    extends: [nodePreset],
  },
]);
