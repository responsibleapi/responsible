import { describe, expect, test } from "vitest"
import type {
  Assert,
  IsEqual,
  IsNever,
  OneExtendsTwo,
} from "../help/type-assertions.ts"
import type { GetOpWithMethod } from "./methods.ts"
import type { OpWithMethod } from "./operation.ts"
import type { CanonicalScope, Scope, ScopeOpts, ScopeRes } from "./scope.ts"
import { scope } from "./scope.ts"
import { declareTags } from "./tags.ts"

type TestOp = {
  res: {
    200: Record<string, never>
  }
}

type ScopeInput<T extends Scope> = Parameters<typeof scope<T>>[0]

describe("scope", () => {
  test("accepts a pure scope with at least two methods", () => {
    type PureScope = {
      GET: TestOp
      POST: TestOp
    }

    type _Test = Assert<OneExtendsTwo<PureScope, ScopeInput<PureScope>>>
  })

  test("rejects a pure scope with only one method", () => {
    type _Test = Assert<IsNever<ScopeInput<{ GET: TestOp }>>>
  })

  test("accepts a flat scope with defaults and at least two methods", () => {
    type PureScopeWithDefaults = {
      forEachOp: ScopeOpts
      GET: TestOp
      POST: TestOp
    }

    type _Test = Assert<
      OneExtendsTwo<PureScopeWithDefaults, ScopeInput<PureScopeWithDefaults>>
    >
  })

  test("rejects a flat scope with defaults and only one method", () => {
    type _Test = Assert<
      IsNever<ScopeInput<{ forEachOp: ScopeOpts; GET: TestOp }>>
    >
  })

  test("rejects empty objects and unrelated props in scope defaults", () => {
    type _EmptyObject = Assert<IsNever<ScopeRes<{}>>>

    type _RandomProp = Assert<
      IsNever<
        ScopeRes<{
          noSuchProp: {
            mime: "application/json"
          }
        }>
      >
    >
  })

  test("accepts a scope with a single method and a single path", () => {
    type MixedScope = {
      GET: TestOp
      "/videos": TestOp
    }

    type _Test = Assert<OneExtendsTwo<MixedScope, ScopeInput<MixedScope>>>
  })

  test("rejects a scope with a single path", () => {
    type PathOnlyScope = {
      "/videos": TestOp
    }

    type _Test = Assert<IsNever<ScopeInput<PathOnlyScope>>>
  })

  test("rejects a scope with defaults and a single path", () => {
    type PathOnlyScopeWithDefaults = {
      forEachOp: ScopeOpts
      "/videos": TestOp
    }

    type _Test = Assert<IsNever<ScopeInput<PathOnlyScopeWithDefaults>>>
  })

  test("accepts a scope with at least two paths", () => {
    type PathOnlyScope = {
      "/videos": TestOp
      "/channels": TestOp
    }

    type _Test = Assert<OneExtendsTwo<PathOnlyScope, ScopeInput<PathOnlyScope>>>
  })

  test("rejects method helper results on method keys", () => {
    type InvalidMethodHelperScope = {
      GET: GetOpWithMethod
      POST: TestOp
    }

    type _Test = Assert<
      IsEqual<
        OneExtendsTwo<InvalidMethodHelperScope, Parameters<typeof scope>[0]>,
        false
      >
    >
  })

  test("accepts method helper results on path keys", () => {
    type PathOnlyScope = {
      "/videos": OpWithMethod
      "/channels": OpWithMethod
    }

    type _Test = Assert<OneExtendsTwo<PathOnlyScope, ScopeInput<PathOnlyScope>>>
  })

  test("accepts declared tags in scope defaults", () => {
    const tags = declareTags({
      videos: {},
      channels: {},
    } as const)

    type _Test = Assert<
      IsEqual<
        NonNullable<ScopeOpts<typeof tags>["tags"]>,
        readonly (typeof tags.videos | typeof tags.channels)[]
      >
    >
  })

  test("returns canonical runtime shape", () => {
    const scoped = scope({
      forEachOp: { tags: [] },
      pathParams: { id: {} },
      params: [],
      GET: { res: { 200: {} } },
      "/logs": { res: { 200: {} } },
    }) as CanonicalScope

    expect(scoped).toEqual({
      forEachOp: { tags: [] },
      forEachPath: {
        pathParams: { id: {} },
        params: [],
      },
      routes: {
        GET: { res: { 200: {} } },
        "/logs": { res: { 200: {} } },
      },
    })
  })
})
