import { build } from "bun"
import genPkg from "../generator/package.json"
import pkg from "./package.json"

await build({
  outdir: "dist/",
  entrypoints: ["src/index.ts"],
  external: Object.keys({ ...pkg.dependencies, ...genPkg.dependencies }),
  target: "node",
  sourcemap: "external",
})
