module.exports = {
  arrowParens: "avoid",
  semi: false,
  trailingComma: "all",
  plugins: [
    require("prettier-plugin-packagejson"),
    require("prettier-plugin-organize-imports"),
    require("prettier-plugin-tailwindcss"),
  ],
  pluginSearchDirs: false,
}
