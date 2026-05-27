import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import yaml from "./openai.yaml" with { type: "yaml" }
import openaiAPI from "./openai.ts"

describe("openai", () => {
  test("openai.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(openaiAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })
})
