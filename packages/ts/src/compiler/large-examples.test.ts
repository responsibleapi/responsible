import { describe, expect, test } from "vitest"
import { validateDoc } from "../help/validate-doc.ts"

/**
 * Story 6: large specs validate end-to-end; named query params and named HTTP
 * basic auth register under `components` with `$ref` at operation scope.
 * Golden `src/examples/*.json` files are not updated here — those tests compare
 * full document equality and remain snapshot-drifted until examples are
 * refreshed.
 */
describe("large example specs (Story 6)", () => {
  test("readme validates; named parameters and security scheme in components", async () => {
    const { default: readmeAPI } = await import("../examples/readme.ts")
    const doc = await validateDoc(readmeAPI)

    expect(doc.components?.parameters?.["page"]).toMatchObject({
      in: "query",
      name: "page",
    })
    expect(doc.components?.parameters?.["perPage"]).toMatchObject({
      in: "query",
      name: "perPage",
    })
    expect(doc.components?.securitySchemes?.["apiKey"]).toMatchObject({
      type: "http",
      scheme: "basic",
    })

    const getSpec = doc.paths?.["/api-specification"]?.get

    expect(
      getSpec?.parameters?.some(
        p => "$ref" in p && p.$ref === "#/components/parameters/page",
      ),
    ).toBe(true)
    expect(
      getSpec?.parameters?.some(
        p => "$ref" in p && p.$ref === "#/components/parameters/perPage",
      ),
    ).toBe(true)
  })

  test("listenbox validates as OpenAPI 3.1 with many paths", async () => {
    const { default: listenboxAPI } = await import("../examples/listenbox.ts")
    const doc = await validateDoc(listenboxAPI)

    expect(doc.openapi).toBe("3.1.0")
    expect(Object.keys(doc.paths ?? {}).length).toBeGreaterThan(10)
  })
})
