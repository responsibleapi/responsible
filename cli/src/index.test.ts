import { describe, expect, test } from "vitest"
import { readFile } from "fs/promises"
import { parse } from "kdljs"

describe.concurrent("index", () => {
  test("kdl parse no errors", async () => {
    const texts = await Promise.all(
      ["listenbox", "yanic", "elkx"].map(name =>
        readFile(`tryout/${name}.kdl`, "utf-8"),
      ),
    )

    for (const text of texts) {
      const x = parse(text)
      console.log(JSON.stringify(x.output, null, 2))
      expect(x.errors, JSON.stringify(x.errors, null, 2)).to.be.empty
    }
  })
})
