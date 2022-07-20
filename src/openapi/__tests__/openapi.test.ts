import { describe, expect, test } from "vitest"
import { OpenAPIV3_1 } from "openapi-types"

import { toOpenAPI, toPaths, traverse } from "../openapi"
import { scope } from "../../dsl/endpoint"
import yanic from "../../tryout/yanic"
import elkx from "../../tryout/elkx"

describe.concurrent("openapi generator", () => {
  test("yanic", () => {
    console.log(JSON.stringify(toOpenAPI(yanic), null, 2))
  })

  test("elkx", () => {
    console.log(JSON.stringify(toOpenAPI(elkx), null, 2))
  })

  test("traverse", () => {
    expect(
      traverse({
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
          req: { body: undefined, headers: {} },
          res: { body: undefined, codes: {}, headers: {} },
        },
        "/baz/qux",
        {},
      ],
    ])
  })

  test("to paths", () => {
    const getPath = ([s]: [string, OpenAPIV3_1.PathItemObject]) => s
    expect(toPaths({}, { endpoints: {}, opts: {} }).map(getPath)).toEqual([])

    expect(
      toPaths({}, { endpoints: { "/foo": {}, "/bar": {} }, opts: {} }).map(
        getPath,
      ),
    ).toEqual(["/foo", "/bar"])

    expect(
      toPaths(
        {},
        {
          endpoints: {
            "/foo": {},
            "/bar": {},
            "/baz": scope({
              "/qux": {},
            }),
          },
        },
      ).map(getPath),
    ).toEqual(["/foo", "/bar", "/baz/qux"])
  })
})
