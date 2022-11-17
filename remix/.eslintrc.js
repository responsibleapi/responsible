/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],
  parserOptions: { project: "../tsconfig.base.json" },
}
