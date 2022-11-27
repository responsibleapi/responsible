import OpenApiValidator from "openapi-schema-validator"
import { toOpenApi } from "../../openapi/to-open-api"
import yanicJSON from "../../../tryout/yanic.json"
import { describe, expect, test } from "vitest"
import { OpenAPIV3 } from "openapi-types"
import { readFile } from "fs/promises"
import { kdlToCore } from "./kdl"
import { parse } from "kdljs"

describe.concurrent("kdl", () => {
  const clean = <T>(t: T): T => JSON.parse(JSON.stringify(t))

  const validate = (x: OpenAPIV3.Document): void =>
    expect(
      new OpenApiValidator({ version: 3 }).validate(clean(x)).errors,
    ).toEqual([])

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
})
