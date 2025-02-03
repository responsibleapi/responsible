import { Command } from "commander"
import { parse as parseKDL } from "kdljs"
import * as fs from "node:fs/promises"
import { toOpenAPI } from "../../generator/src/kdl"
import * as packageJSON from "../package.json"

function die(s: string): never {
  console.error(s)
  return process.exit(1)
}

const onKdlChange =
  (jsonPath: string) =>
  async (kdlPath: string): Promise<void> => {
    console.time(`writing ${jsonPath}`)

    const doc = parseKDL(await fs.readFile(kdlPath, "utf8"))
    if (doc.output) {
      await fs.writeFile(
        jsonPath,
        JSON.stringify(toOpenAPI(doc.output), null, 2),
      )
      console.timeEnd(`writing ${jsonPath}`)
    } else {
      console.error(JSON.stringify(doc.errors, null, 2))
    }
  }

const program = new Command(packageJSON.name)
  .description(packageJSON.description)
  .version(packageJSON.version)
  .helpCommand(true)
  .argument("file", "Responsible .kdl file", x =>
    x.endsWith(".kdl") ? x : undefined,
  )
  .option("-o, --output <*.json>", "Output OpenAPI .json file", (x?: string) =>
    x?.endsWith(".json") ? x : undefined,
  )
  .option("-w, --watch", "Watch for changes", false)
  .action(
    async (
      file: string,
      { watch, output }: { watch: boolean; output?: string },
    ) => {
      console.log(file, watch, output)

      if (watch) {
        if (!output) return die("Must specify --output when using --watch")

        for await (const { filename, eventType } of fs.watch(file)) {
          if (!filename?.endsWith(".kdl")) continue
          console.log(eventType, filename)
          await onKdlChange(output)(file)
        }
      } else {
        const doc = parseKDL(await fs.readFile(file, "utf8"))
        if (!doc.output) {
          return die(`kdl parse errors: ${JSON.stringify(doc.errors, null, 2)}`)
        }

        const json = JSON.stringify(toOpenAPI(doc.output), null, 2)
        if (output) {
          await fs.writeFile(output, json)
        } else {
          console.log(json)
        }
      }
    },
  )

export const main = (): Promise<Command> => program.parseAsync()
