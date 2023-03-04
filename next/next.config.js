/** @type {import("next").NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // runtime: "edge",
    appDir: true,
    externalDir: true,
  },
}
