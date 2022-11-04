import { describe, expect, test } from "vitest"
import fc from "fast-check"

import { fromOpenApi, schemaName, toRequiredBag } from "./from-open-api"
import { arbOpenApiDoc } from "./__tests__/openapigen"
import { toOpenApi } from "./to-open-api"
import { string } from "../dsl/schema"

const clean = (t: unknown): unknown => JSON.parse(JSON.stringify(t))

describe.concurrent("openapi generator", () => {
  test("generator", () => {
    fc.assert(
      fc.property(arbOpenApiDoc(), gen => {
        const coreD = fromOpenApi(gen)
        const openapiD = toOpenApi(coreD)

        try {
          expect(clean(openapiD)).toEqual(clean(gen))
        } catch (e) {
          console.log("one", JSON.stringify(gen))
          console.log("two", JSON.stringify(openapiD))
          throw e
        }
      }),
    )
  })

  test("to required bag", () => {
    expect(
      toRequiredBag("path", {
        parameters: [{ in: "path", name: "name", schema: { type: "string" } }],
      }),
    ).toEqual({ name: { type: "string" } })
  })

  test("schema name", () => {
    expect(schemaName(`#/components/schemas//lol`)).toEqual("/lol")
  })
})
