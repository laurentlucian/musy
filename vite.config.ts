import { resolve } from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./app/express.server.ts",
        }
      : undefined,
  },
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
      "@shared": resolve(__dirname, "./shared"),
      ...(command === "build" && {
        // bun & react production fix
        // https://github.com/remix-run/react-router/issues/12568#issuecomment-2692406113
        "react-dom/server": "react-dom/server.node",
      }),
    },
  },
}));
