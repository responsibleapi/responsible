import { describe, test } from "vitest"
import type { Assert, IsEqual, OneExtendsTwo } from "./type-assertions.ts"

describe("typelevel", () => {
  test("accepts subtype relationships", () => {
    type _LiteralToPrimitive = Assert<OneExtendsTwo<"a", string>>
    type _ObjectExtension = Assert<
      OneExtendsTwo<{ a: string; b: number }, { a: string }>
    >
  })

  test("rejects non-subtype relationships", () => {
    type _PrimitiveToLiteral = Assert<
      IsEqual<OneExtendsTwo<string, "a">, false>
    >
    type _UnionToMember = Assert<
      IsEqual<OneExtendsTwo<string | number, string>, false>
    >
  })

  test("accepts identical types", () => {
    type _Primitive = Assert<IsEqual<string, string>>
    type _Object = Assert<
      IsEqual<{ a: string; b: number }, { b: number; a: string }>
    >
    type _Union = Assert<IsEqual<string | number, number | string>>
  })

  test("rejects subtype-only matches", () => {
    type _Broader = Assert<IsEqual<IsEqual<"a", string>, false>>
    type _Narrower = Assert<IsEqual<IsEqual<string, "a">, false>>
  })

  test("rejects distinct shapes", () => {
    type _DifferentProp = Assert<
      IsEqual<
        IsEqual<{ a: string; b: number }, { a: string; b: boolean }>,
        false
      >
    >
  })
})
