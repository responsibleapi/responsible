import { build } from "bun"
import pkg from "./package.json"

await build({
  outdir: "dist/",
  entrypoints: ["src/kdl.ts"],
  external: Object.keys(pkg.dependencies),
  target: "node",
  sourcemap: "external",
})
