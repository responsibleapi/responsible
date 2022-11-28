import { toOpenApi } from "../../generator/src/openapi/to-open-api"
import { kdlToCore } from "../../generator/src/dsl/kdl/kdl"
import packageJson from "../package.json"
import { readFile } from "fs/promises"
import * as process from "process"
import { parse } from "kdljs"
import arg from "arg"

const die = (s: string): never => {
  console.error(s)
  return process.exit(1)
}

const main = async () => {
  const args = arg({
    "--version": Boolean,
  })

  if (args["--version"]) {
    console.log(packageJson.version)
    return
  }

  const file = args._[0]
  if (!file) return die("Specify a .kdl file")
  if (!file.endsWith(".kdl")) return die(`expected .kdl file, got ${file}`)

  const kdl = await readFile(file, "utf8")
  const doc = parse(kdl)
  if (!doc.output) {
    return die(`kdl parse errors: ${JSON.stringify(doc.errors, null, 2)}`)
  }

  console.log(JSON.stringify(toOpenApi(kdlToCore(doc.output)), null, 2))
}

void main()
