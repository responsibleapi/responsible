import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import theJSON from "./http-benchmark.json"
import httpBenchmarkAPI from "./http-benchmark.ts"

describe("http-benchmark example", () => {
  test("http-benchmark.json validates as OpenAPI", async () => {
    expect(await validateDoc(theJSON)).toEqual(theJSON)
  })

  test("httpBenchmarkAPI matches http-benchmark.json", async () => {
    expect(canonical(await validateDoc(httpBenchmarkAPI))).toEqual(
      canonical(theJSON as oas31.OpenAPIObject),
    )
  })
})
