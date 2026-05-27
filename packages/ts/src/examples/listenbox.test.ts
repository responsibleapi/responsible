import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import yaml from "./listenbox.yaml" with { type: "yaml" }
import listenboxAPI from "./listenbox.ts"

describe("listenbox", () => {
  test("listenbox.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(listenboxAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })
})
