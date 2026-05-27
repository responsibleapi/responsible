import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import yaml from "./readme.yaml" with { type: "yaml" }
import readmeAPI from "./readme.ts"

describe("readme example", () => {
  test("readme.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(readmeAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })
})
