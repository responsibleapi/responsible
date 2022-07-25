import { describe, expect, test } from "vitest"
import fc from "fast-check"

import { fromOpenApi } from "../from-open-api"
import { arbOpenApiDoc } from "./openapigen"
import { toOpenApi } from "../to-open-api"

describe.concurrent("openapi generator", () => {
  test("generator", () => {
    fc.assert(
      fc.property(arbOpenApiDoc(), doc => {
        expect(toOpenApi(fromOpenApi(doc))).toEqual(doc)
      }),
    )
  })
})
