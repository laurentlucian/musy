import { unstable_vitePlugin as remix } from '@remix-run/dev';
// import { installGlobals } from "@remix-run/node";

// @ts-expect-error not typed yet
import { remixDevTools } from 'remix-development-tools/vite';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// installGlobals();

export default defineConfig({
  plugins: [
    remixDevTools(),
    remix({
      ignoredRouteFiles: ['**/.*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes);
      },
      serverModuleFormat: 'esm',
    }),
    tsconfigPaths(),
  ],
});
