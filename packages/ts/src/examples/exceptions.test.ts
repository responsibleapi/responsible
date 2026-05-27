import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import yaml from "./exceptions.yaml" with { type: "yaml" }
import theAPI from "./exceptions.ts"

describe("exceptions", () => {
  test("exceptions.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(theAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })
})
