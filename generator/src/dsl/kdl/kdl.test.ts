import { toOpenApi } from "../../openapi/to-open-api"
import yanicJSON from "../../../tryout/yanic.json"
import { describe, expect, test } from "vitest"
import { readFile } from "fs/promises"
import { toCore } from "./kdl"
import { parse } from "kdljs"

describe.concurrent("kdl", () => {
  test("to core", async () => {
    const { errors, output } = parse(
      await readFile("tryout/listenbox.kdl", "utf8"),
    )
    expect(errors).toEqual([])

    const core = toCore(output)
    expect(core.info.title).toEqual("Listenbox")

    const es = core.refs["ErrorStruct"]
    if (es.type !== "object") throw new Error(JSON.stringify(es))

    const msg = es.fields["message"]
    if (typeof msg === "string") throw new Error(msg)

    expect(msg.type).toEqual("optional")
  })

  const clean = (t: unknown): unknown => JSON.parse(JSON.stringify(t))

  test("yanic", async () => {
    const { output } = parse(await readFile("tryout/yanic.kdl", "utf8"))

    expect(clean(toOpenApi(toCore(output)))).toEqual(yanicJSON)
  })
})
