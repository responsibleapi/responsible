import { toOpenApi } from "../../generator/src/openapi/to-open-api"
import { kdlToCore } from "../../generator/src/dsl/kdl/kdl"
import { version } from "../package.json"
import { readFile } from "fs/promises"
import { parse } from "kdljs"
import arg from "arg"

const die = (s: string): never => {
  console.error(s)
  return process.exit(1)
}

const main = async () => {
  const args = arg({
    "--version": Boolean,
    "--help": Boolean,
  })

  if (args["--version"]) {
    console.log(version)
    return
  }

  if (args["--help"]) {
    console.log(`
Usage: responsible [file]

Options:
  --version  Show version
  --help     Show this help
`)
    return
  }

  const file = args._[0]
  if (!file) return die("Specify a .kdl file")
  if (!file.endsWith(".kdl")) return die(`expected .kdl file, got ${file}`)

  const doc = parse(await readFile(file, "utf8"))
  if (!doc.output) {
    return die(`kdl parse errors: ${JSON.stringify(doc.errors, null, 2)}`)
  }

  console.log(JSON.stringify(toOpenApi(kdlToCore(doc.output)), null, 2))
}

void main()
