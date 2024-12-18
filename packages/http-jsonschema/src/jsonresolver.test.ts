import { expect, test } from "vitest"
import { describe } from "./__tests__/describe"
import { JsonResolver } from "./jsonresolver"

describe("resolve", () => {
  test("should resolve to the correct value for a valid pointer", () => {
    expect(
      new JsonResolver({ a: { b: { c: 42 } } }).resolveRaw("#/a/b/c"),
    ).toEqual(42)
  })

  test("array", () => {
    const jr = new JsonResolver({ a: { b: { c: [1, 2, 3] } } })
    expect(jr.resolveRaw("#/a/b/c/1")).toEqual(2)
  })

  test("should return undefined for an invalid pointer", () => {
    expect(
      new JsonResolver({ a: { b: { c: 42 } } }).resolveRaw("#/a/x/y"),
    ).toBeUndefined()
  })

  test("should return undefined for a pointer to a non-existent property", () => {
    expect(
      new JsonResolver({ a: { b: { c: 42 } } }).resolveRaw("#/a/b/d"),
    ).toBeUndefined()
  })

  test("should handle empty object correctly", () => {
    const obj = {}
    const result = new JsonResolver(obj).resolveRaw("#/")
    expect(result).toEqual({})
  })

  test("should handle pointer to the root", () => {
    const obj = { a: 1, b: 2 }
    const result = new JsonResolver(obj).resolveRaw("#/")
    expect(result).toEqual(obj)
  })
})
