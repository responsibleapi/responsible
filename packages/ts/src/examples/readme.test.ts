import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import theJSON from "./readme.json"
import readmeAPI from "./readme.ts"

describe("readme example", () => {
  test("readme.json is valid", async () => {
    expect(await validateDoc(theJSON)).toEqual(theJSON)
  })

  test("readmeAPI compiles to readme.json", async () => {
    expect(canonical(await validateDoc(readmeAPI))).toEqual(
      canonical(theJSON as oas31.OpenAPIObject),
    )
  })
})
