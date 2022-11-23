import { toOpenApi } from "../../openapi/to-open-api"
import yanicJSON from "../../../tryout/yanic.json"
import { describe, expect, test } from "vitest"
import { isOptional } from "../../core/schema"
import { readFile } from "fs/promises"
import { kdlToCore } from "./kdl"
import { parse } from "kdljs"

describe.concurrent("kdl", () => {
  test("to core", async () => {
    const core = kdlToCore(
      parse(await readFile("tryout/listenbox.kdl", "utf8")).output,
    )
    expect(core.info.title).toEqual("Listenbox")

    const es = core.refs["ErrorStruct"]
    if (es.type !== "object") throw new Error(JSON.stringify(es))
    expect(isOptional(es.fields["message"])).toBeTruthy()
  })

  const clean = (t: unknown): unknown => JSON.parse(JSON.stringify(t))

  test("yanic", async () => {
    const { output } = parse(await readFile("tryout/yanic.kdl", "utf8"))

    expect(clean(toOpenApi(kdlToCore(output)))).toEqual(yanicJSON)
  })

  test("path param in scope", async () => {
    const core = kdlToCore(
      parse(await readFile("tryout/pathParamInScope.kdl", "utf8")).output,
    )

    const path = core.paths["/scope/:foo"]
    expect(Object.keys(path)).toEqual(["POST", "DELETE"])
    for (const element of Object.values(path).filter(x => x)) {
      expect(element.req.pathParams["foo"]).toEqual({
        type: "string",
      })
    }
  })
})
