/** @type {import("@remix-run/dev").AppConfig} */
module.exports = {
  watchPaths: ["../generator/"],
  devServerBroadcastDelay: 1000,
  future: {
    v2_routeConvention: true,
    unstable_tailwind: true,
    unstable_dev: { appServerPort: 8788 },
  },
  ignoredRouteFiles: ["**/.*"],
  server: "./server.js",
  serverBuildPath: "functions/[[path]].js",
  serverConditions: ["worker"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["browser", "module", "main"],
  serverMinify: true,
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
}
