import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import yaml from "./http-benchmark.yaml" with { type: "yaml" }
import httpBenchmarkAPI from "./http-benchmark.ts"

describe("http-benchmark example", () => {
  test("http-benchmark.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(httpBenchmarkAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })
})
