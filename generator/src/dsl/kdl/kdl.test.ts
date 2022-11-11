import { describe, expect, test } from "vitest"
import { readFile } from "fs/promises"
import { toCore } from "./kdl"
import { parse } from "kdljs"

describe.concurrent("kdl", () => {
  test("to core", async () => {
    const r = parse(await readFile("tryout/listenbox.kdl", "utf8"))
    expect(r.errors).toEqual([])
    const core = toCore(r.output)
    expect(core.info.title).toEqual("Listenbox")

    console.log(JSON.stringify(core, null, 2))

    const es = core.refs["ErrorStruct"]
    if (es.type !== "object") throw new Error(JSON.stringify(es))

    const msg = es.fields["message"]
    if (typeof msg === "string") throw new Error(msg)

    expect(msg.type).toEqual("optional")
  })
})
