import { describe, test } from "vitest"
import type { AtLeastOne, AtLeastTwo } from "./lib.ts"
import type { Assert, OneExtendsTwo, IsNever } from "./type-assertions.ts"

type Example = {
  a: string
  b: number
  c: boolean
}

describe("lib", () => {
  test("AtLeastOne accepts objects with at least one property", () => {
    type _Single = Assert<OneExtendsTwo<{ a: string }, AtLeastOne<Example>>>

    type _AllThree = Assert<
      OneExtendsTwo<{ a: string; b: number; c: boolean }, AtLeastOne<Example>>
    >
  })

  test("AtLeastOne rejects empty objects", () => {
    type _Empty = Assert<IsNever<AtLeastOne<{}>>>
  })

  test("accepts objects with at least two properties", () => {
    type _ExactTwo = Assert<
      OneExtendsTwo<{ a: string; b: number }, AtLeastTwo<Example>>
    >

    type _AllThree = Assert<
      OneExtendsTwo<{ a: string; b: number; c: boolean }, AtLeastTwo<Example>>
    >
  })

  test("rejects objects with fewer than two properties", () => {
    type _Single = Assert<IsNever<AtLeastTwo<{ a: 1 }>>>
    type _Empty = Assert<IsNever<AtLeastTwo<{}>>>
  })
})
