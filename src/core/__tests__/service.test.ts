import { describe, expect, test } from "vitest"

import { optional, string } from "../../dsl/schema"
import { isOptional } from "../endpoint"

describe.concurrent("service", () => {
  test("is optional", () => {
    expect(isOptional(string())).toBeFalsy()
    expect(isOptional(optional(string()))).toBeTruthy()
  })
})
