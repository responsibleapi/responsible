import arg from "arg"

import { genVertxKotlinClient } from "./kotlin/vertx-client"
import { genPythonTypes } from "./python/dataclasses"

const generators = {
  "kotlin-vertx": genVertxKotlinClient,
  python: genPythonTypes,
} as const

const args = arg({
  "--outDir": String,
  "--generator": String,

  "-o": "--outDir",
  "-g": "--generator",
})

const g = args["--generator"]

if (!args._.length) throw new Error("no input files")

if (!g) throw new Error("No generator specified")
if (!(g in generators)) throw new Error(`Unknown generator ${g}`)

const outDir = args["--outDir"] || "."
