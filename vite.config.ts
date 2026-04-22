import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { nodeExternals } from "rollup-plugin-node-externals";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  return {
    plugins: [
      nodeExternals(),
      react(),
      dts({ tsconfigPath: "./tsconfig.build.json", rollupTypes: true }),
    ],
    build: {
      lib: {
        entry: "src/index.ts",
        formats: ["es"],
      },
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        output: {
          entryFileNames: "[name].js",
          preserveModules: true,
        },
      },
    },
  };
});
