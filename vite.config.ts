import { cloudflare } from "@cloudflare/vite-plugin";
import { unstable_reactRouterRSC as reactRouterRSC } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => ({
  server: {
    port: 3000,
    host: false,
  },
  plugins: [
    // cloudflare({
    //   viteEnvironment: {
    //     name: "ssr",
    //   },
    // }),
    tailwindcss(),
    tsconfigPaths(),
    reactRouterRSC(),
    rsc(),
  ],
}));
