import { describe, expect, test } from "vitest"
import pachca from "../examples/pachca.json"
import { validateSchema } from "./validate-schema.ts"

describe("validateSchema", () => {
  test("accepts OpenAPI x-* schema extensions from pachca", () => {
    const schema =
      pachca.components.schemas.LinkPreviewsRequest.properties.link_previews

    expect(validateSchema(schema)).toEqual(schema)
  })
})
