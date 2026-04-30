import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { canonical } from "../help/canonical.ts"
import { validateDoc } from "../help/validate-doc.ts"
import theJSON from "./exceptions.json"
import theAPI from "./exceptions.ts"

describe("exceptions", () => {
  test("json", async () => {
    expect(await validateDoc(theJSON)).toEqual(theJSON)
  })

  test("fixture", async () => {
    expect(canonical(await validateDoc(theAPI))).toEqual(
      canonical(theJSON as oas31.OpenAPIObject),
    )
  })
})
