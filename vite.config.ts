import { resolve } from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/postcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./app/express.server.ts",
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
      "@shared": resolve(__dirname, "./shared"),
    },
  },
}));
