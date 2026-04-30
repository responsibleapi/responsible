import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { responsibleAPI } from "../dsl/dsl.ts"
import { GET, HEAD, POST } from "../dsl/methods.ts"
import { named } from "../dsl/nameable.ts"
import { resp } from "../dsl/operation.ts"
import { responseHeader } from "../dsl/response-headers.ts"
import { int32, object, string, unknown } from "../dsl/schema.ts"
import { scope } from "../dsl/scope.ts"
import { validateDoc } from "../help/validate-doc.ts"

describe("response", () => {
  test("scope-level res.mime is a wildcard default mime", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Wildcard mime", version: "1" },
      },
      forEachOp: {
        res: {
          mime: "application/json",
          add: {
            400: unknown(),
          },
        },
      },
      routes: {
        "/items": GET({
          res: {
            200: object({ ok: string() }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    const paths = rapi.paths ?? {}

    expect(paths["/items"]?.get?.responses).toEqual({
      ["200"]: {
        description: "200",
        content: {
          ["application/json"]: {
            schema: {
              type: "object",
              properties: { ok: { type: "string" } },
              required: ["ok"],
            },
          },
        },
      },
      ["400"]: {
        description: "400",
      },
    } satisfies oas31.ResponsesObject)
  })

  test("inherited res.add provides statuses, but local op.res beats inherited add", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Add precedence", version: "1" },
      },
      forEachOp: {
        res: {
          mime: "application/json",
          add: {
            200: string(),
            404: unknown(),
          },
        },
      },
      routes: {
        "/x": GET({
          res: {
            200: int32(),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    const paths = rapi.paths ?? {}

    expect(paths["/x"]?.get?.responses).toEqual({
      ["200"]: {
        description: "200",
        content: {
          ["application/json"]: {
            schema: { type: "integer", format: "int32" },
          },
        },
      },
      ["404"]: {
        description: "404",
      },
    } satisfies oas31.ResponsesObject)
  })

  test("bare unknown omits content, explicit body keeps it", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Unknown response body", version: "1" },
      },
      forEachOp: {
        res: { mime: "application/json" },
      },
      routes: {
        "/bare": GET({
          res: {
            200: unknown(),
          },
        }),
        "/explicit": GET({
          res: {
            200: resp({ body: unknown() }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    const paths = rapi.paths ?? {}

    expect(paths["/bare"]?.get?.responses).toEqual({
      ["200"]: {
        description: "200",
      },
    } satisfies oas31.ResponsesObject)

    expect(paths["/explicit"]?.get?.responses).toEqual({
      ["200"]: {
        description: "200",
        content: {
          ["application/json"]: {
            schema: {},
          },
        },
      },
    } satisfies oas31.ResponsesObject)
  })

  test("synthetic HEAD from GET headID strips response bodies and uses headID as operationId", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Head synthesis", version: "1" },
      },
      forEachOp: {
        res: { mime: "application/json" },
      },
      routes: {
        "/p": GET({
          id: "getP",
          headID: "headP",
          res: { 200: object({ ok: string() }) },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    const paths = rapi.paths ?? {}

    expect(paths["/p"]?.head).toEqual({
      operationId: "headP",
      responses: {
        ["200"]: {
          description: "200",
        },
      },
    } satisfies oas31.OperationObject)
  })

  test("explicit HEAD strips response bodies", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Explicit head", version: "1" },
      },
      forEachOp: {
        res: { mime: "application/json" },
      },
      routes: {
        "/p": HEAD({
          id: "headP",
          res: { 200: object({ ok: string() }) },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    const paths = rapi.paths ?? {}

    expect(paths["/p"]?.head?.responses).toEqual({
      ["200"]: {
        description: "200",
      },
    } satisfies oas31.ResponsesObject)
  })

  test("explicit HEAD prevents GET headID synthesis overwrite", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Explicit head wins", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/p": scope({
          HEAD: {
            id: "explicitHead",
            res: { 200: unknown() },
          },
          GET: {
            id: "getP",
            headID: "syntheticHead",
            res: { 200: object({ ok: string() }) },
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    const paths = rapi.paths ?? {}

    expect(paths["/p"]?.head?.operationId).toEqual("explicitHead")
  })

  test("Set-Cookie header schema uses name=[^;]+ pattern", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Cookie pattern", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/c": GET({
          res: {
            200: {
              description: "ok",
              cookies: { sid: string({ minLength: 1 }) },
            },
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(
      rapi.paths?.["/c"]?.get?.responses?.["200"]?.headers?.["set-cookie"],
    ).toEqual({
      required: true,
      schema: { type: "string", pattern: "sid=[^;]+" },
    })
  })

  test("rejects multiple cookies on one response", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "Multi cookie", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/c": GET({
            res: {
              200: {
                cookies: { a: string(), b: string() },
              },
            },
          }),
        },
      }),
    ).toThrow(/multiple cookies/)
  })

  test("rejects multiple cookies after merging defaults and response", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "Merged cookies", version: "1" },
        },
        forEachOp: {
          req: { mime: "application/json" },
          res: {
            defaults: {
              "200": resp({ cookies: { a: string() } }),
            },
          },
        },
        routes: {
          "/c": GET({
            res: {
              200: {
                description: "x",
                cookies: { b: string() },
                body: object({ ok: string() }),
              },
            },
          }),
        },
      }),
    ).toThrow(/multiple cookies/)
  })

  const traceHeader = named(
    "trace-id",
    responseHeader({
      description: "Correlation id",
      schema: string(),
      required: true,
    }),
  )

  test("headerParams stays inline on the response", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Reused response header", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/x": GET({
          res: {
            200: resp({
              description: "ok",
              headerParams: [traceHeader],
              body: object({ ok: string() }),
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(
      rapi.paths?.["/x"]?.get?.responses?.["200"]?.headers?.["trace-id"],
    ).toEqual({ $ref: "#/components/headers/trace-id" })
  })

  test("headerParams expands to response header keys (including Link casing)", async () => {
    const link = named(
      "link",
      responseHeader({
        description: "Pagination link relation",
        schema: string(),
      }),
    )
    const total = named(
      "x-total-count",
      responseHeader({
        description: "Total hits",
        schema: string(),
      }),
    )

    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "headerParams", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/p": GET({
          res: {
            200: resp({
              description: "page",
              headerParams: [link, total] as const,
              body: object({ items: object({}) }),
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(rapi.paths?.["/p"]?.get?.responses?.["200"]?.headers).toEqual({
      Link: {
        $ref: "#/components/headers/link",
      },
      "x-total-count": {
        $ref: "#/components/headers/x-total-count",
      },
    })
  })

  test("headerParams strips Header suffix to derive header name", async () => {
    function LocationHeader() {
      return responseHeader({
        required: true,
        schema: string({ format: "uri" }),
      })
    }

    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Location header", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/download": GET({
          res: {
            302: resp({
              description: "redirect",
              headerParams: [LocationHeader],
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)
    expect(rapi.paths?.["/download"]?.get?.responses?.["302"]?.headers).toEqual(
      { location: { $ref: "#/components/headers/LocationHeader" } },
    )
  })

  test("inline response headers keep wrapper metadata outside nested schema", async () => {
    const TraceValue = named(
      "TraceValue",
      string({
        description: "Trace schema",
        examples: ["trace-schema-example"],
      }),
    )

    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Inline response headers", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/x": GET({
          res: {
            200: resp({
              headers: {
                "X-Trace": {
                  description: "Trace header",
                  example: "trace-header-example",
                  style: "simple",
                  explode: false,
                  schema: TraceValue,
                },
              },
              body: object({ ok: string() }),
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(rapi.components?.schemas?.["TraceValue"]).toEqual({
      type: "string",
      description: "Trace schema",
      examples: ["trace-schema-example"],
    })
    expect(rapi.paths?.["/x"]?.get?.responses?.["200"]?.headers).toEqual({
      "X-Trace": {
        required: true,
        description: "Trace header",
        example: "trace-header-example",
        style: "simple",
        explode: false,
        schema: { $ref: "#/components/schemas/TraceValue" },
      },
    })
  })

  test("optional inline response headers omit required", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Optional inline response headers", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/x": GET({
          res: {
            200: resp({
              headers: {
                "X-Trace?": {
                  description: "Trace header",
                  example: "trace-header-example",
                  schema: string(),
                },
              },
              body: object({ ok: string() }),
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)
    expect(rapi.paths?.["/x"]?.get?.responses?.["200"]?.headers).toEqual({
      "X-Trace": {
        required: false,
        description: "Trace header",
        example: "trace-header-example",
        schema: { type: "string" },
      },
    })
  })

  test("the same named header thunk reused across routes stays inline", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Shared header component", version: "1" },
      },
      forEachOp: { res: { mime: "application/json" } },
      routes: {
        "/a": GET({
          res: {
            200: resp({
              headerParams: [traceHeader],
              body: object({ a: string() }),
            }),
          },
        }),
        "/b": GET({
          res: {
            200: resp({
              headerParams: [traceHeader],
              body: object({ b: string() }),
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(
      rapi.paths?.["/a"]?.get?.responses?.["200"]?.headers?.["trace-id"],
    ).toEqual({
      $ref: "#/components/headers/trace-id",
    })
    expect(
      rapi.paths?.["/b"]?.get?.responses?.["200"]?.headers?.["trace-id"],
    ).toEqual({
      $ref: "#/components/headers/trace-id",
    })
  })

  test("reuses named schema across request body and response header without mutating header shape", async () => {
    const Shared = named(
      "SharedHeaderValue",
      string({
        description: "Shared header value",
        examples: ["trace-123"],
        pattern: /^[a-z0-9-]+$/,
      }),
    )

    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Shared body and header schema", version: "1" },
      },
      forEachOp: {
        req: { mime: "application/json" },
        res: { mime: "application/json" },
      },
      routes: {
        "/x": POST({
          req: Shared,
          res: {
            200: resp({
              headers: {
                "X-Trace": Shared,
              },
              body: object({ ok: string() }),
            }),
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(rapi.components?.schemas?.["SharedHeaderValue"]).toEqual({
      type: "string",
      description: "Shared header value",
      examples: ["trace-123"],
      pattern: "^[a-z0-9-]+$",
    })
    expect(rapi.paths?.["/x"]?.post?.requestBody).toEqual({
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/SharedHeaderValue" },
        },
      },
    })
    expect(rapi.paths?.["/x"]?.post?.responses?.["200"]?.headers).toEqual({
      "X-Trace": {
        required: true,
        schema: { $ref: "#/components/schemas/SharedHeaderValue" },
      },
    })
  })

  test("rejects the same components.headers name with a different header definition", () => {
    const h1 = named("x", responseHeader({ schema: string() }))
    const h2 = named("x", responseHeader({ schema: int32() }))

    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "Header clash", version: "1" },
        },
        forEachOp: { res: { mime: "application/json" } },
        routes: {
          "/c": GET({
            res: {
              200: resp({
                headerParams: [h1],
                body: object({ ok: string() }),
              }),
              201: resp({
                headerParams: [h2],
                body: object({ ok: string() }),
              }),
            },
          }),
        },
      }),
    ).toThrow(/components\.headers: name "x" is already used/)
  })
})
