import { describe, expect, test } from "vitest"
import * as fs from "fs/promises"
import { parse } from "kdljs"

describe.concurrent("index", () => {
  test("KDL parsing", async () => {
    const loaded = parse(await fs.readFile("tryout/listenbox.kdl", "utf-8"))
    expect(loaded.errors, JSON.stringify(loaded.errors, null, 2)).empty
  })
})
