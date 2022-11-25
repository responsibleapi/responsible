import OpenApiValidator from "openapi-schema-validator"
import { toOpenApi } from "../../openapi/to-open-api"
import yanicJSON from "../../../tryout/yanic.json"
import { describe, expect, test } from "vitest"
import { OpenAPIV3 } from "openapi-types"
import { readFile } from "fs/promises"
import { kdlToCore } from "./kdl"
import { parse } from "kdljs"

const clean = <T>(t: T): T => JSON.parse(JSON.stringify(t))

const validate = (x: OpenAPIV3.Document): void => {
  const errors = new OpenApiValidator({ version: 3 }).validate(clean(x)).errors
  console.error(JSON.stringify(errors, null, 2))
  return expect(errors).toEqual([])
}

describe.concurrent("kdl", () => {
  test("to core", async () => {
    validate(
      toOpenApi(
        kdlToCore(parse(await readFile("tryout/listenbox.kdl", "utf8")).output),
      ),
    )
  })

  test("yanic", async () => {
    const openapi = toOpenApi(
      kdlToCore(parse(await readFile("tryout/yanic.kdl", "utf8")).output),
    )
    expect(clean(openapi)).toEqual(yanicJSON)
    validate(openapi)
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
