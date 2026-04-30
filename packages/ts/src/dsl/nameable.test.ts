import { describe, expect, test } from "vitest"
import type {
  Assert,
  IsEqual,
  IsNever,
  OneExtendsTwo,
} from "../help/type-assertions.ts"
import type { Nameable, NamedThunk } from "./nameable.ts"
import { decodeNameable, named, ref } from "./nameable.ts"

type NamedArg<T extends Parameters<typeof named>[1]> = Parameters<
  typeof named<T>
>[1]

describe("nameable", () => {
  test("assigns a component name to value-based definitions", () => {
    const inp = {
      in: "query",
      name: "$.xgafv",
    } as const

    const xgafv = named("_.xgafv", inp)
    expect(xgafv.name).toBe("_.xgafv")
    expect(xgafv()).toEqual(inp)
  })

  test("accepts object values", () => {
    type _Test = Assert<
      IsEqual<
        { type: "string"; minLength: 1 },
        NamedArg<{ type: "string"; minLength: 1 }>
      >
    >
  })

  test("rejects thunk-based definitions", () => {
    type _Test = Assert<
      IsNever<NamedArg<() => { type: "string"; minLength: 1 }>>
    >
  })

  test("rejects function-valued nameables", () => {
    type _Test = Assert<IsNever<Nameable<() => string>>>
  })

  test("someNamedFunc is Nameable", () => {
    const someNamedFunc = (): 1 => 1

    type _Test2 = Assert<OneExtendsTwo<typeof someNamedFunc, Nameable<1>>>
  })

  test("ref preserves name and forwarded value", () => {
    const inp = { in: "query" as const, name: "q" }
    const inner = named("Param", inp)
    const wrapped = ref(inner, { summary: "S" })

    expect(wrapped).not.toBe(inner)
    expect(wrapped.name).toBe("Param")
    expect(wrapped()).toEqual(inp)
    expect(decodeNameable<typeof inp>(wrapped)).toEqual({
      name: "Param",
      value: inp,
      summary: "S",
    })
  })

  test("decodeNameable omits siblings when unset", () => {
    const inp = { in: "query" as const, name: "q" }
    const inner = named("Param", inp)
    expect(decodeNameable<typeof inp>(inner)).toEqual({
      name: "Param",
      value: inp,
    })
  })

  test("ref preserves existing summary when outer wrapper adds description", () => {
    const inp = { in: "query" as const, name: "q" }
    const inner = named("Param", inp)
    const withSummary = ref(inner, { summary: "S" })
    const withDescription = ref(withSummary, { description: "D" })

    expect(withDescription.summary).toBe("S")
    expect(decodeNameable<typeof inp>(withDescription)).toEqual({
      name: "Param",
      value: inp,
      summary: "S",
      description: "D",
    })
  })

  test("ref reuses siblings via object spread", () => {
    const inp = { in: "query" as const, name: "q" }
    const inner = named("Param", inp)
    const withDesc = ref(inner, { description: "D" })

    const reused = { description: withDesc.description ?? "" }
    const withBoth = ref(withDesc, { ...reused, summary: "S" })

    expect(decodeNameable<typeof inp>(withBoth)).toEqual({
      name: "Param",
      value: inp,
      summary: "S",
      description: "D",
    })
  })

  test("ref own field wins when sibling is reused via spread", () => {
    const inp = { in: "query" as const, name: "q" }
    const inner = ref(named("Param", inp), { summary: "inner" })
    const reused = { summary: inner.summary }
    const outer = ref(inner, { ...reused, summary: "outer" })

    expect(decodeNameable<typeof inp>(outer)).toEqual({
      name: "Param",
      value: inp,
      summary: "outer",
    })
  })

  test("decodeNameable on scalar returns value only", () => {
    const v = { type: "string" as const }
    expect(decodeNameable<typeof v>(v)).toEqual({ value: v })
  })

  test("type-level: scalars are not NamedThunk (ref first arg)", () => {
    type _Test = Assert<
      IsEqual<
        false,
        OneExtendsTwo<{ in: "query" }, NamedThunk<{ in: "query" }>>
      >
    >
  })
})
