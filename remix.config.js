/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */

module.exports = {
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: {
    unstable_dev: true,
  },
  ignoredRouteFiles: ['**/.*'],
};
// module.exports = {
//   appDirectory: "app",
//   browserBuildDirectory: "public/build",
//   publicPath: "/build/",
//   serverBuildDirectory: "build",
//   devServerPort: 8002,
//   ignoredRouteFiles: [".*"]
// };
