import { unstable_vitePlugin as remix } from '@remix-run/dev';

import { flatRoutes } from 'remix-flat-routes';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ['**/.*'],
      routes: async (defineRoutes) => {
        return flatRoutes('routes', defineRoutes);
      },
      serverModuleFormat: 'cjs',
    }),
    tsconfigPaths(),
  ],
});
