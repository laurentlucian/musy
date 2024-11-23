import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { remixDevTools } from 'remix-development-tools';
import { expressDevServer } from 'remix-express-dev-server';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals({ nativeFetch: true });

export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [
    expressDevServer({ exportName: 'musy' }),
    // envOnlyMacros(),
    // remixDevTools(),
    tsconfigPaths(),
    remix({
      ignoredRouteFiles: ['**/.*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes);
      },
      future: {
        v3_singleFetch: true,
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
      serverModuleFormat: 'esm',
    }),
  ],
});
