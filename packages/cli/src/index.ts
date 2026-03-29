import { Command } from "commander"
import { parse as parseKDL } from "kdljs"
import * as fs from "node:fs/promises"
import { toOpenAPI } from "../../generator/src/kdl"
import * as pkgJSON from "../package.json" with { type: "json" }

const KDL_PARSE_ERRORS = "KDL parse errors:"

const onKdlChange =
  (jsonPath: string) =>
  async (kdlPath: string): Promise<void> => {
    const label = `Writing ${jsonPath}`
    console.time(label)

    const doc = parseKDL(await fs.readFile(kdlPath, "utf8"))
    if (doc.output) {
      await fs.writeFile(
        jsonPath,
        JSON.stringify(toOpenAPI(doc.output), null, 2),
      )
      console.timeEnd(label)
    } else {
      console.error(KDL_PARSE_ERRORS, JSON.stringify(doc.errors, null, 2))
    }
  }

const program = new Command(pkgJSON.name)
  .description(pkgJSON.description)
  .version(pkgJSON.version)
  .helpCommand(true)
  .argument("file", "Responsible .kdl file")
  .option("-o, --output <file>", "Output OpenAPI .json file")
  .option("-w, --watch", "Watch for changes")
  .action(
    async (
      file: string,
      { watch, output }: { watch?: boolean; output?: string },
    ) => {
      if (watch) {
        if (!output) {
          console.error("Must specify --output when using --watch")
          return
        }

        for await (const { filename, eventType } of fs.watch(file)) {
          if (!filename?.endsWith(".kdl")) continue
          console.log(eventType, filename)
          await onKdlChange(output)(file)
        }
      } else {
        const doc = parseKDL(await fs.readFile(file, "utf8"))
        if (!doc.output) {
          console.error(KDL_PARSE_ERRORS, JSON.stringify(doc.errors, null, 2))
          return
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
