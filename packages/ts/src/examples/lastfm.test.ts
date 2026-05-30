import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import listenboxAPI from "./lastfm.ts"
import yaml from "./lastfm.yaml" with { type: "yaml" }

describe("lastfm", () => {
  test("lastfm.yaml validates as OpenAPI", async () => {
    expect(canonical(await validateDoc(listenboxAPI))).toEqual(
      canonical(yaml as oas31.OpenAPIObject),
    )
  })
})
