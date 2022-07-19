import { optional, string } from "../../dsl/schema"
import { describe, expect, test } from "vitest"
import { isOptional } from "../service"

describe.concurrent("service", () => {
  test("is optional", () => {
    expect(isOptional(string())).toBeFalsy()
    expect(isOptional(optional(string()))).toBeTruthy()
  })
})
