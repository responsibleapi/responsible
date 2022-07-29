import { describe, expect, test } from "vitest"
import { string } from "../../dsl/schema"
import { isSchema } from "../endpoint"

describe.concurrent("schema", () => {
  test("is schema", () => {
    expect(isSchema({})).toBeFalsy()
    expect(isSchema(string())).toBeTruthy()
  })
})
