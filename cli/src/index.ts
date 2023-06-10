import { parseOpenAPI } from "../../generator/src/kdl"
import { version } from "../package.json"
import arg from "arg"
import chokidar from "chokidar"
import { readFile, writeFile } from "fs/promises"
import { parse } from "kdljs"

const die = (s: string): never => {
  console.error(s)
  return process.exit(1)
}

const onKdlChange =
  (jsonPath: string) =>
  async (kdlPath: string): Promise<void> => {
    console.time(`writing ${jsonPath}`)

    const doc = parse(await readFile(kdlPath, "utf8"))
    if (doc.output) {
      await writeFile(
        jsonPath,
        JSON.stringify(parseOpenAPI(doc.output), null, 2),
      )
      console.timeEnd(`writing ${jsonPath}`)
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

const help = `
Usage: responsible [file]

Options:
  --version Show version
  --help    Show this help
  --output  Output file
  --watch   Watch for changes. Requires --output
`

const main = async () => {
  if (args["--version"]) {
    console.log(version)
    return
  }

  if (args["--help"]) {
    console.log(help)
    return
  }

  const file = args._[0]
  if (!file) return die("Specify a .kdl file")
  if (!file.endsWith(".kdl")) return die(`expected .kdl file, got ${file}`)

  const out = args["--output"]
  if (args["--watch"]) {
    if (!out) return die("Must specify --output with --watch")

    await onKdlChange(out)(file)
    chokidar.watch(file).on("change", onKdlChange(out))
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
