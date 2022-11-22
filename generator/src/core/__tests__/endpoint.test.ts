import { describe, expect, test } from "vitest"
import { isMime } from "../schema"

describe.concurrent("endpoint", () => {
  test("is mime", () => {
    expect(isMime("foo/bar; charset=utf-8")).toBeTruthy()
    expect(isMime("foo/bar")).toBeTruthy()
    expect(isMime("bar")).toBeFalsy()
  })
})
