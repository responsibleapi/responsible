import arg from "arg"

import { genPythonTypes, genVertxKotlinClient } from "@responsible/generator"

const generators = {
  "kotlin-vertx": genVertxKotlinClient,
  python: genPythonTypes,
} as const

const args = arg({
  "--outDir": String,
  "--generator": String,
  "--packageName": String,

  "-o": "--outDir",
  "-g": "--generator",
})

const g = args["--generator"]

if (!args._.length) throw new Error("no input files")

if (!g) throw new Error("No generator specified")
if (!(g in generators)) throw new Error(`Unknown generator ${g}`)

const outDir = args["--outDir"] || "."

const file = args._[0]
