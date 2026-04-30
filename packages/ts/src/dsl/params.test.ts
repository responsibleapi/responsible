import { describe, expect, test } from "vitest"
import type { Assert, OneExtendsTwo } from "../help/type-assertions.ts"
import { named } from "./nameable.ts"
import type { Op } from "./operation.ts"
import { queryParam, type PathParamRaw } from "./params.ts"
import type { Schema } from "./schema.ts"

type ReqObject = Exclude<NonNullable<Op["req"]>, Schema>
type Param = NonNullable<ReqObject["params"]>[number]

describe("params", () => {
  test("accepts raw query params in params arrays", () => {
    type _Test = Assert<OneExtendsTwo<ReturnType<typeof queryParam>, Param>>
  })

  test("accepts named params in params arrays", () => {
    const xgafv = named(
      "_.xgafv",
      queryParam({
        name: "_.xgafv",
        schema: { type: "string" } as const,
      }),
    )

    type _Test = Assert<OneExtendsTwo<typeof xgafv, Param>>
  })

  test("adds query location automatically", () => {
    expect(
      queryParam({
        name: "part",
        schema: { type: "string" } as const,
      }),
    ).toEqual({
      in: "query",
      name: "part",
      schema: { type: "string" } as const,
    })
  })

  test("accepts path params with path-specific styles in params arrays", () => {
    const resourceID = {
      in: "path",
      required: true,
      name: "resourceID",
      style: "simple",
      schema: { type: "string" } as const,
    } satisfies PathParamRaw

    type _Test = Assert<OneExtendsTwo<typeof resourceID, Param>>
  })
})
