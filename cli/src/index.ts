import { parseOpenAPI } from "../../generator/src/kdl"
import { readFile, writeFile } from "fs/promises"
import { version } from "../package.json"
import chokidar from "chokidar"
import { parse } from "kdljs"
import arg from "arg"

const die = (s: string): never => {
  console.error(s)
  return process.exit(1)
}

const onKdlChange = async (json: string, kdl: string): Promise<void> => {
  console.time(`writing ${json}`)
  const doc = parse(await readFile(kdl, "utf8"))
  if (doc.output) {
    await writeFile(json, JSON.stringify(parseOpenAPI(doc.output), null, 2))
    console.timeEnd(`writing ${json}`)
  } else {
    console.error(JSON.stringify(doc.errors, null, 2))
  }
}

const args = arg({
  "--watch": Boolean,
  "--version": Boolean,
  "--help": Boolean,
  "--output": String,

  "-w": "--watch",
  "-o": "--output",
})

const main = async () => {
  if (args["--version"]) {
    console.log(version)
    return
  }

  if (args["--help"]) {
    console.log(`
Usage: responsible [file]

Options:
  --version Show version
  --help    Show this help
  --output  Output file
  --watch   Watch for changes. Requires --output
`)
    return
  }

  const file = args._[0]
  if (!file) return die("Specify a .kdl file")
  if (!file.endsWith(".kdl")) return die(`expected .kdl file, got ${file}`)

  const out = args["--output"]
  if (args["--watch"]) {
    if (!out) return die("Must specify --output with --watch")

    await onKdlChange(out, file)
    chokidar.watch(file).on("change", path => onKdlChange(out, path))
    return
  }

  const doc = parse(await readFile(file, "utf8"))
  if (!doc.output) {
    return die(`kdl parse errors: ${JSON.stringify(doc.errors, null, 2)}`)
  }

  const json = JSON.stringify(parseOpenAPI(doc.output), null, 2)
  if (out) {
    await writeFile(out, json)
  } else {
    console.log(json)
  }
}

void main()
