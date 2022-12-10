import { readFile } from "fs/promises"
import { expect, test } from "vitest"
import { parse } from "kdljs"

test.concurrent("kdl parse no errors", async () => {
  const texts = await Promise.all(
    ["listenbox", "yanic", "elkx"].map(name =>
      readFile(`../generator/tryout/${name}.kdl`, "utf-8"),
    ),
  )

  for (const text of texts) {
    const { errors } = parse(text)
    expect(errors, JSON.stringify(errors, null, 2)).to.be.empty
  }
})
