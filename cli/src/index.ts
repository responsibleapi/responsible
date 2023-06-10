import { readFile, writeFile } from "fs/promises"
import arg from "arg"
import { watch } from "chokidar"
import { parse } from "kdljs"
import { parseOpenAPI } from "../../generator/src/kdl"
import { version } from "../package.json"

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
  "--help": Boolean,
  "--output": String,
  "--version": Boolean,
  "--watch": Boolean,

  "-h": "--help",
  "-o": "--output",
  "-v": "--version",
  "-w": "--watch",
})

const help = `
Usage: responsible [file]

Options:
  -h, --help      Show this help
  -o, --output    Output file
  -v, --version   Show version
  -w, --watch     Watch for changes. Requires --output
`

export const main = async (): Promise<void> => {
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
    watch(file).on("change", onKdlChange(out))
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
