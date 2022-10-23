import { flattenScopes, scope } from "../endpoint"
import { describe, expect, test } from "vitest"

describe.concurrent("dsl", () => {
  test("traverse", () => {
    expect(
      flattenScopes({
        endpoints: {
          "/foo": {},
          "/bar": {},
          "/baz": scope({
            "/qux": {},
          }),
        },
      }),
    ).toEqual([
      [{}, "/foo", {}],
      [{}, "/bar", {}],
      [
        {
          req: { body: undefined, headers: {}, cookies: {} },
          res: { body: undefined, codes: {}, headers: {} },
        },
        "/baz/qux",
        {},
      ],
    ])
  })
})
