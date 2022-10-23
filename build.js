const { Generator } = require("npm-dts")
const { build } = require("esbuild")

const {
  dependencies,
  peerDependencies,
  devDependencies,
} = require("./package.json")

const entry = "src/index.ts"

const shared = {
  entryPoints: [entry],
  bundle: true,
  external: Object.keys({
    ...dependencies,
    ...peerDependencies,
    ...devDependencies,
  }),
}

build({
  ...shared,
  outfile: "dist/index.js",
})

build({
  ...shared,
  outfile: "dist/index.esm.js",
  format: "esm",
})

new Generator({
  entry,
  output: "dist/index.d.ts",
}).generate()
