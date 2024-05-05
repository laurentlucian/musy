import { vitePlugin as remix } from '@remix-run/dev';
import { remixDevTools } from 'remix-development-tools';
import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    remixDevTools(),
    tsconfigPaths(),
    remix({
      ignoredRouteFiles: ['**/.*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes);
      },
      serverModuleFormat: 'esm',
    }),
  ],
});
