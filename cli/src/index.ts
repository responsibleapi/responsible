import { toOpenApi } from "../../generator/src/openapi/to-open-api"
import { kdlToCore } from "../../generator/src/dsl/kdl/kdl"
import { readFile } from "fs/promises"
import * as process from "process"
import { parse } from "kdljs"

const die = (s: string): never => {
  console.error(s)
  return process.exit(1)
}

const main = async () => {
  const file = process.argv[process.argv.length - 1]
  if (!file.endsWith(".kdl")) {
    return die(`expected .kdl file, got ${file}`)
  }

  const kdl = await readFile(file, "utf8")
  const doc = parse(kdl)
  if (!doc.output) {
    return die(`kdl parse errors: ${JSON.stringify(doc.errors, null, 2)}`)
  }

  console.log(JSON.stringify(toOpenApi(kdlToCore(doc.output)), null, 2))
}

void main()
