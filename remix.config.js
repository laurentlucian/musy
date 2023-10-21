const { createRoutesFromFolders } = require('@remix-run/v1-route-convention');

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['**/.*'],
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes);
  },
  serverMinify: true,
  serverModuleFormat: 'cjs',
  serverPlatform: 'node',
};
