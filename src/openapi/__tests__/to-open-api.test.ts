import { describe, expect, test } from "vitest"

import { optional, string } from "../../dsl/schema"
import { toParam, toSchema } from "../to-open-api"

describe.concurrent("to OpenAPI", () => {
  test("to param", () => {
    expect(toParam("name", optional(string()), "path")).toEqual({
      in: "path",
      name: "name",
      schema: toSchema(string()),
    })

    expect(toParam("name", string(), "path")).toEqual({
      in: "path",
      name: "name",
      required: true,
      schema: toSchema(string()),
    })
  })
})
