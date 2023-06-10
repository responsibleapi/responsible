/** @type {import("eslint").Linter.Config} */
module.exports = {
  parserOptions: { project: "./tsconfig.json" },
  rules: {
    "no-console": "off",
  },
}
