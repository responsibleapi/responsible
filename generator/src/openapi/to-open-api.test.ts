import { describe, expect, test } from "vitest"

import { toParam, toSchemaOrRef } from "./to-open-api"
import { optional, string } from "../dsl/schema"

describe.concurrent("to OpenAPI", () => {
  test("to param", () => {
    expect(toParam("name", optional(string()), "path")).toEqual({
      in: "path",
      name: "name",
      schema: toSchemaOrRef(string()),
    })

    expect(toParam("name", string(), "path")).toEqual({
      in: "path",
      name: "name",
      required: true,
      schema: toSchemaOrRef(string()),
    })
  })
})
