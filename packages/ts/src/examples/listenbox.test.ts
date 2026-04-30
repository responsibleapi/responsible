import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import json from "./listenbox.json"
import listenboxAPI from "./listenbox.ts"

describe("listenbox", () => {
  test("listenbox.json validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(listenboxAPI))).toEqual(
      canonical(json as oas31.OpenAPIObject),
    )
  })
})
