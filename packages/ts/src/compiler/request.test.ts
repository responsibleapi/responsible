import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { responsibleAPI } from "../dsl/dsl.ts"
import { GET, POST } from "../dsl/methods.ts"
import { named } from "../dsl/nameable.ts"
import { resp, type Op } from "../dsl/operation.ts"
import { headerParam, pathParam, queryParam } from "../dsl/params.ts"
import { array, int32, object, string } from "../dsl/schema.ts"
import type { PathRoutes } from "../dsl/scope.ts"
import { scope } from "../dsl/scope.ts"
import {
  headerSecurity,
  httpSecurity,
  oauth2Requirement,
  oauth2Security,
  securityAND,
  securityOR,
} from "../dsl/security.ts"
import { validateDoc } from "../help/validate-doc.ts"
import { ErrorMsg } from "./errors.ts"

function operationRequestMime(
  op: oas31.OperationObject | undefined,
  mime: string,
): oas31.MediaTypeObject | undefined {
  const rb = op?.requestBody

  if (
    rb === undefined ||
    typeof rb !== "object" ||
    !("content" in rb) ||
    rb.content === undefined
  ) {
    return undefined
  }

  return rb.content[mime]
}

describe("request", () => {
  test("compiles query and header params", async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/search": GET({
          req: {
            query: { q: string(), "limit?": string() },
            headers: { "X-Request-Id": string() },
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    const get = doc.paths!["/search"]?.get

    expect(get?.parameters).toEqual([
      {
        name: "q",
        in: "query",
        required: true,
        schema: { type: "string" },
      },
      {
        name: "limit",
        in: "query",
        schema: { type: "string" },
      },
      {
        name: "X-Request-Id",
        in: "header",
        required: true,
        schema: { type: "string" },
      },
    ])
  })

  test("bare-schema map params keep schema metadata nested", async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/search": GET({
          req: {
            query: {
              page: int32({ description: "Page number" }),
              "cursor?": string({ example: "next-cursor" }),
              "tags?": array(string(), {
                description: "Tags to include",
              }),
            },
            headers: {
              "X-Retry-Count?": int32({ description: "Retry count" }),
            },
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.paths!["/search"]?.get?.parameters).toEqual([
      {
        name: "page",
        in: "query",
        required: true,
        schema: {
          type: "integer",
          format: "int32",
          description: "Page number",
        },
      },
      {
        name: "cursor",
        in: "query",
        schema: {
          type: "string",
          example: "next-cursor",
        },
      },
      {
        name: "tags",
        in: "query",
        schema: {
          type: "array",
          description: "Tags to include",
          items: { type: "string" },
        },
      },
      {
        name: "X-Retry-Count",
        in: "header",
        schema: {
          type: "integer",
          format: "int32",
          description: "Retry count",
        },
      },
    ])
  })

  test("reuses named schema across body, query, header, and path without mutating parameter shape", async () => {
    const Shared = named(
      "SharedToken",
      string({
        description: "Shared token",
        examples: ["alpha"],
        pattern: /^[a-z]+$/,
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Shared schema contexts", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/items/:id": POST({
          req: {
            body: Shared,
            pathParams: { id: Shared },
            query: { filter: Shared },
            headers: { "X-Trace": Shared },
          },
          res: { 200: object({ ok: string() }) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.components?.schemas?.["SharedToken"]).toEqual({
      type: "string",
      description: "Shared token",
      examples: ["alpha"],
      pattern: "^[a-z]+$",
    })
    expect(doc.paths?.["/items/{id}"]?.post?.requestBody).toEqual({
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/SharedToken" },
        },
      },
    } satisfies oas31.RequestBodyObject)
    expect(doc.paths?.["/items/{id}"]?.post?.parameters).toEqual([
      {
        name: "id",
        in: "path",
        required: true,
        schema: { $ref: "#/components/schemas/SharedToken" },
      },
      {
        name: "filter",
        in: "query",
        required: true,
        schema: { $ref: "#/components/schemas/SharedToken" },
      },
      {
        name: "X-Trace",
        in: "header",
        required: true,
        schema: { $ref: "#/components/schemas/SharedToken" },
      },
    ])
  })

  test("inline map params keep wrapper metadata outside nested schema", async () => {
    const Cursor = named(
      "cursor",
      queryParam({
        name: "cursor",
        example: "cursor-param-example",
        schema: string({ examples: ["cursor-schema-example"] }),
      }),
    )
    const CursorSchemaOnly = named(
      "cursorSchemaOnly",
      queryParam({
        name: "cursor_schema_only",
        schema: string({
          description: "Cursor schema description",
          examples: ["cursor-schema-only-example"],
        }),
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Parameter schema examples", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/items/:id": GET({
          req: {
            pathParams: {
              id: {
                description: "Item id parameter",
                example: "item-123",
                style: "label",
                explode: false,
                schema: string({
                  description: "Item id schema",
                  examples: ["item-123-schema"],
                }),
              },
            },
            query: {
              filter: {
                description: "Filter parameter",
                example: "status:open",
                schema: string({
                  description: "Filter schema",
                  example: "status:closed",
                }),
              },
              "tags?": {
                schema: array(string()),
              },
            },
            headers: {
              "X-Trace": {
                description: "Trace parameter",
                example: "trace-123",
                schema: string({
                  description: "Trace schema",
                  examples: ["trace-456"],
                }),
              },
            },
            params: [Cursor, CursorSchemaOnly],
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.paths?.["/items/{id}"]?.get?.parameters).toEqual([
      {
        name: "id",
        in: "path",
        required: true,
        description: "Item id parameter",
        example: "item-123",
        style: "label",
        explode: false,
        schema: {
          type: "string",
          description: "Item id schema",
          examples: ["item-123-schema"],
        },
      },
      {
        name: "filter",
        in: "query",
        required: true,
        description: "Filter parameter",
        example: "status:open",
        schema: {
          type: "string",
          description: "Filter schema",
          example: "status:closed",
        },
      },
      {
        name: "tags",
        in: "query",
        schema: {
          type: "array",
          items: { type: "string" },
        },
      },
      {
        $ref: "#/components/parameters/cursor",
      },
      {
        $ref: "#/components/parameters/cursorSchemaOnly",
      },
      {
        name: "X-Trace",
        in: "header",
        required: true,
        description: "Trace parameter",
        example: "trace-123",
        schema: {
          type: "string",
          description: "Trace schema",
          examples: ["trace-456"],
        },
      },
    ])
  })

  test("schema component registration stays order-independent across body and parameter sites", async () => {
    const Shared = named(
      "StableShared",
      string({
        description: "Stable shared schema",
        examples: ["alpha"],
      }),
    )

    const paramFirst = await validateDoc(
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "Param first", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/items/:id": POST({
            req: {
              pathParams: { id: Shared },
            },
            res: { 200: object({}) },
          }),
          "/body": POST({
            req: Shared,
            res: { 200: object({}) },
          }),
        },
      }),
    )
    const bodyFirst = await validateDoc(
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "Body first", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/body": POST({
            req: Shared,
            res: { 200: object({}) },
          }),
          "/items/:id": POST({
            req: {
              pathParams: { id: Shared },
            },
            res: { 200: object({}) },
          }),
        },
      }),
    )

    expect(paramFirst.components?.schemas?.["StableShared"]).toEqual({
      type: "string",
      description: "Stable shared schema",
      examples: ["alpha"],
    })
    expect(bodyFirst.components?.schemas?.["StableShared"]).toEqual(
      paramFirst.components?.schemas?.["StableShared"],
    )
  })

  test("named reusable query param stays inline", async () => {
    const PageToken = named(
      "pageToken",
      queryParam({
        name: "page_token",
        schema: string(),
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/items": GET({
          req: { params: [PageToken] },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)

    expect(doc.paths!["/items"]?.get?.parameters).toEqual([
      {
        $ref: "#/components/parameters/pageToken",
      },
    ])
  })

  test("raw path params in params array keep wrapper metadata", async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/items/:id": GET({
          req: {
            params: [
              pathParam({
                name: "id",
                description: "Item id parameter",
                example: "item-123",
                style: "label",
                explode: false,
                schema: string({
                  description: "Item id schema",
                  examples: ["item-123-schema"],
                }),
              }),
            ],
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.paths?.["/items/{id}"]?.get?.parameters).toEqual([
      {
        name: "id",
        in: "path",
        required: true,
        description: "Item id parameter",
        example: "item-123",
        style: "label",
        explode: false,
        schema: {
          type: "string",
          description: "Item id schema",
          examples: ["item-123-schema"],
        },
      },
    ])
  })

  test("inline params with ref schemas keep param example on schema too", async () => {
    const EventKey = named("EventKey", string())

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/items": GET({
          req: {
            query: {
              "event_key?": {
                description: "Event key filter",
                example: "user_login",
                schema: EventKey,
              },
            },
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.paths!["/items"]?.get?.parameters).toEqual([
      {
        name: "event_key",
        in: "query",
        description: "Event key filter",
        example: "user_login",
        schema: {
          $ref: "#/components/schemas/EventKey",
          example: "user_login",
        },
      },
    ])
  })

  test("inherited forEachOp params stay on operations and local params append after them", async () => {
    const Version = named(
      "version",
      headerParam({
        name: "X-Version",
        schema: string(),
      }),
    )
    const Locale = named(
      "locale",
      queryParam({
        name: "locale",
        schema: string(),
      }),
    )
    const Page = named(
      "page",
      queryParam({
        name: "page",
        schema: string(),
      }),
    )
    const Limit = named(
      "limit",
      queryParam({
        name: "limit",
        schema: string(),
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: {
        req: {
          mime: "application/json",
          params: [Version],
        },
      },
      routes: {
        "/v1/items": scope({
          forEachOp: {
            req: { params: [Locale] },
          },
          GET: {
            req: { params: [Page] },
            res: { 200: object({}) },
          },
          POST: {
            req: { params: [Limit] },
            res: { 200: object({}) },
          },
        }),
      },
    })

    const doc = await validateDoc(api)
    const pathItem = doc.paths?.["/v1/items"]

    expect(doc).toEqual(api)
    expect(pathItem?.parameters).toBeUndefined()
    expect(pathItem?.get?.parameters).toEqual([
      { $ref: "#/components/parameters/version" },
      { $ref: "#/components/parameters/locale" },
      { $ref: "#/components/parameters/page" },
    ])
    expect(pathItem?.post?.parameters).toEqual([
      { $ref: "#/components/parameters/version" },
      { $ref: "#/components/parameters/locale" },
      { $ref: "#/components/parameters/limit" },
    ])
  })

  test("inherits default mime for shorthand body from forEachOp", async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/x": POST({
          req: object({ name: string() }),
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(
      operationRequestMime(doc.paths!["/x"]?.post, "application/json"),
    ).toBeDefined()
  })

  test("rejects operation-level req.mime", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "Req API", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/x": POST({
            req: {
              // @ts-expect-error operation-level mime is rejected by types
              mime: "application/xml",
              body: string(),
            },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(ErrorMsg.operationRequestMime)
  })

  test("rejects downstream workbook export operation-level req.mime", () => {
    const WorkbookExportRequest = object({})
    const WorkbookExportResponse = object({})

    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: {
            title: "Recurring Workbook Export Service API",
            version: "1",
          },
        },
        routes: {
          "/healthz": GET({
            id: "healthCheck",
            description:
              "Operational health check for reverse proxies and load balancers.",
            res: {
              200: resp({
                description: "Service is healthy.",
              }),
            },
          }),
          "/exports/workbook": POST("createWorkbookExport", {
            req: {
              // @ts-expect-error operation-level mime is rejected by types
              mime: "application/json",
              body: WorkbookExportRequest,
            },
            res: {
              201: WorkbookExportResponse,
            },
          }),
        },
      }),
    ).toThrow(ErrorMsg.operationRequestMime)
  })

  test('compiles `"body?"` without requestBody.required', async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/x": POST({
          req: {
            "body?": object({ name: string() }),
          } as NonNullable<Op["req"]>,
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.paths!["/x"]?.post?.requestBody).toEqual({
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
    } satisfies oas31.RequestBodyObject)
  })

  test('operation `"body?"` overrides inherited required body', async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: {
        req: {
          mime: "application/json",
          body: object({ parent: string() }),
        },
      },
      routes: {
        "/x": POST({
          req: {
            "body?": object({ child: string() }),
          } as NonNullable<Op["req"]>,
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.paths!["/x"]?.post?.requestBody).toEqual({
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              child: { type: "string" },
            },
            required: ["child"],
          },
        },
      },
    } satisfies oas31.RequestBodyObject)
  })

  test("rejects optional path param key", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/a/:id": {
            method: "GET",
            req: {
              pathParams: { "id?": string() },
            },
            res: { 200: object({}) },
          },
        } as PathRoutes,
      }),
    ).toThrow(/Optional path parameter key/)
  })

  test("rejects pathParams key not present in path template", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/a/:id": GET({
            req: { pathParams: { id: string(), extra: string() } },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/does not appear in path template/)
  })

  test("rejects missing path param schema", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/a/:id": GET({
            req: { pathParams: {} },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/Missing schema for path parameter/)
  })

  test("rejects duplicate query param from params array and query map", () => {
    const Q = named("qDup", queryParam({ name: "q", schema: string() }))

    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/search": GET({
            req: {
              params: [Q],
              query: { q: string() },
            },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/Duplicate query parameter/)
  })

  test("rejects duplicate query param across inherited and operation layers", () => {
    const ScopeQ = named("scopeQ", queryParam({ name: "q", schema: string() }))
    const OpQ = named("opQ", queryParam({ name: "q", schema: string() }))

    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: {
          req: {
            mime: "application/json",
            params: [ScopeQ],
          },
        },
        routes: {
          "/search": GET({
            req: {
              params: [OpQ],
            },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/Duplicate query parameter "q"/)
  })

  test("rejects conflicting reuse of components.parameters name", () => {
    const A = named(
      "dupParam",
      queryParam({ name: "alpha_token", schema: string() }),
    )
    const B = named(
      "dupParam",
      queryParam({ name: "beta_token", schema: int32() }),
    )

    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/a": GET({
            req: { params: [A, B] },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/components\.parameters: name "dupParam"/)
  })

  test("rejects conflicting reuse of components.securitySchemes name", () => {
    const A = named("auth", httpSecurity({ scheme: "bearer" }))
    const B = named("auth", httpSecurity({ scheme: "basic" }))

    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json", security: A } },
        routes: {
          "/x": GET({
            req: { security: B },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/components\.securitySchemes: name "auth"/)
  })

  test("appends security requirements per scope and operation", async () => {
    const Bearer = named("bearerAuth", httpSecurity({ scheme: "bearer" }))
    const ApiKey = named("apiKeyAuth", headerSecurity({ name: "X-Api-Key" }))
    const Basic = named("basicAuth", httpSecurity({ scheme: "basic" }))

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Sec API", version: "1" },
      },
      forEachOp: {
        req: {
          mime: "application/json",
          security: Bearer,
        },
      },
      routes: {
        "/v1/r": GET({
          req: {
            security: securityOR(ApiKey, Basic),
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.components?.securitySchemes?.["bearerAuth"]).toMatchObject({
      type: "http",
      scheme: "bearer",
    })
    expect(doc.components?.securitySchemes?.["apiKeyAuth"]).toMatchObject({
      type: "apiKey",
      in: "header",
    })
    expect(doc.paths!["/v1/r"]?.get?.security).toEqual([
      { bearerAuth: [] },
      { apiKeyAuth: [] },
      { basicAuth: [] },
    ] satisfies oas31.SecurityRequirementObject[])
  })

  test("compiles top-level security from ResponsibleApiInput.security", async () => {
    const Bearer = named("bearerAuth", httpSecurity({ scheme: "bearer" }))

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Sec API", version: "1" },
      },
      security: Bearer,
      routes: {
        "/x": GET({
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.security).toEqual([
      { bearerAuth: [] },
    ] satisfies oas31.SecurityRequirementObject[])
    expect(doc.components?.securitySchemes?.["bearerAuth"]).toEqual({
      type: "http",
      scheme: "bearer",
    })
  })

  test("registers named schemes from explicit composed security wrappers", async () => {
    const Oauth2 = named(
      "Oauth2",
      oauth2Security({
        flows: {
          implicit: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            scopes: {
              "scope:read": "Read data",
              "scope:write": "Write data",
            },
          },
        },
      }),
    )
    const Oauth2c = named(
      "Oauth2c",
      oauth2Security({
        flows: {
          authorizationCode: {
            authorizationUrl: "https://accounts.google.com/o/oauth2/auth",
            tokenUrl: "https://accounts.google.com/o/oauth2/token",
            scopes: {
              "scope:read": "Read data",
              "scope:write": "Write data",
            },
          },
        },
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Sec API", version: "1" },
      },
      routes: {
        "/x": GET({
          req: {
            security: securityOR(
              securityAND(
                oauth2Requirement(Oauth2, ["scope:read"]),
                oauth2Requirement(Oauth2c, ["scope:read"]),
              ),
              securityAND(
                oauth2Requirement(Oauth2, ["scope:write"]),
                oauth2Requirement(Oauth2c, ["scope:write"]),
              ),
            ),
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.paths?.["/x"]?.get?.security).toEqual([
      {
        Oauth2: ["scope:read"],
        Oauth2c: ["scope:read"],
      },
      {
        Oauth2: ["scope:write"],
        Oauth2c: ["scope:write"],
      },
    ] satisfies oas31.SecurityRequirementObject[])
    expect(doc.components?.securitySchemes?.["Oauth2"]).toMatchObject({
      type: "oauth2",
    })
    expect(doc.components?.securitySchemes?.["Oauth2c"]).toMatchObject({
      type: "oauth2",
    })
  })

  test("security? appends empty requirement after its requirements", async () => {
    const Bearer = named("bearerAuth", httpSecurity({ scheme: "bearer" }))

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Sec API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/x": GET({
          req: {
            "security?": Bearer,
          },
          res: { 200: object({}) },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc).toEqual(api)
    expect(doc.paths!["/x"]?.get?.security).toEqual([
      { bearerAuth: [] },
      {},
    ] satisfies oas31.SecurityRequirementObject[])
  })

  test("preserves operation-level vendor extensions", async () => {
    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Req API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/items": GET({
          res: { 200: object({}) },
          "x-paginated": true,
          "x-requirements": { scope: "items:read" },
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.paths?.["/items"]?.get).toMatchObject({
      "x-paginated": true,
      "x-requirements": { scope: "items:read" },
    } satisfies Partial<oas31.OperationObject>)
  })
})
