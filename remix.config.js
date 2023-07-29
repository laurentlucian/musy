/** @type {import('@remix-run/dev').AppConfig} */

module.exports = {
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
  },
  ignoredRouteFiles: ['**/.*'],
  serverMinify: true,
  serverModuleFormat: 'cjs',
  serverPlatform: 'node',
};
