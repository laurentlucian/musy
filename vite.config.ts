import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import nitro from "@hiogawa/vite-plugin-nitro";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  const wasmPath = resolve(__dirname, "app/generated/prisma/client/wasm.js");

  return {
    server: {
      port: 3000,
      host: false,
    },
    resolve: {
      alias: {
        "@prisma/client": resolve(
          __dirname,
          "node_modules",
          "@prisma",
          "client",
        ),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: "prisma-local-plugin",
            setup(build: any) {
              build.onResolve(
                { filter: /^.prisma\/client\/default/ },
                async () => {
                  return {
                    path: wasmPath,
                  };
                },
              );
            },
          },
        ],
      },
    },
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tailwindcss(),
      tsconfigPaths(),
      reactRouterRSC(),
      rsc(),
      nitro({
        server: {
          environmentName: "rsc",
        },
        config: {
          preset: "cloudflare_module",
          cloudflare: {
            nodeCompat: true,
          },
          plugins: ["~/nitro.plugin"],
        },
      }),
    ],
  };
});
