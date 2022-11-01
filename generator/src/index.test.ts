import { describe, test } from "vitest"
import * as fs from "fs/promises"
import * as yaml from "js-yaml"

describe.concurrent("index", () => {
  test("yaml parsing", async () => {
    const loaded = await yaml.load(
      await fs.readFile("tryout/listenbox.yml", "utf-8"),
      {
        schema: yaml.DEFAULT_SCHEMA.extend([]),
      },
    )
    console.log(loaded)
  })
})
