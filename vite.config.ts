import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { nodeExternals } from "rollup-plugin-node-externals";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  console.log(`Building in ${mode} mode...`);

  return {
    plugins: [
      nodeExternals(),
      react(),
      dts({ tsconfigPath: "./tsconfig.build.json" }),
    ],
    build: {
      lib: {
        entry: "src/index.ts",
        formats: ["es"],
      },
      minify: isProduction,
      sourcemap: isProduction,
      rollupOptions: {
        output: {
          entryFileNames: "[name].js",
          preserveModules: true,
          preserveModulesRoot: "src",
        },
      },
    },
  };
});
