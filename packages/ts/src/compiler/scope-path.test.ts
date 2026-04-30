import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { validateDoc } from "../help/validate-doc.ts"
import { responsibleAPI } from "../dsl/dsl.ts"
import { GET } from "../dsl/methods.ts"
import { named } from "../dsl/nameable.ts"
import { headerParam } from "../dsl/params.ts"
import { int32, object, string } from "../dsl/schema.ts"
import { scope } from "../dsl/scope.ts"
import { declareTags } from "../dsl/tags.ts"

describe("compiler scope and path", () => {
  test("nested scopes join paths, inherit req/res, convert :params, nearest tags", async () => {
    const tags = declareTags({ users: { description: "Users" } } as const)
    const Err = object({ message: string() })
    const User = object({ id: int32(), name: string() })

    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Scoped API", version: "1" },
      },
      forEachOp: {
        req: { mime: "application/json" },
        res: {
          defaults: {
            "400..499": { mime: "application/json" },
          },
          add: {
            404: { body: Err },
          },
        },
      },
      routes: {
        "/v1/users/:userId": GET({
          tags: [tags.users],
          req: {
            pathParams: { userId: int32() },
          },
          res: {
            200: {
              headers: { "X-Trace": string() },
              body: { "application/json": User },
            },
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(rapi).toEqual({
      openapi: "3.1.0",
      info: {
        title: "Scoped API",
        version: "1",
      },
      paths: {
        "/v1/users/{userId}": {
          get: {
            tags: ["users"],
            parameters: [
              {
                name: "userId",
                in: "path",
                required: true,
                schema: {
                  type: "integer",
                  format: "int32",
                },
              },
            ],
            responses: {
              ["200"]: {
                description: "200",
                headers: {
                  ["X-Trace"]: {
                    required: true,
                    schema: { type: "string" },
                  },
                },
                content: {
                  ["application/json"]: {
                    schema: {
                      type: "object",
                      properties: {
                        id: { type: "integer", format: "int32" },
                        name: { type: "string" },
                      },
                      required: ["id", "name"],
                    },
                  },
                },
              },
              ["404"]: {
                description: "404",
                content: {
                  ["application/json"]: {
                    schema: {
                      type: "object",
                      properties: {
                        message: { type: "string" },
                      },
                      required: ["message"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    } satisfies oas31.OpenAPIObject)
  })

  test("rejects duplicate path and method after template normalization", () => {
    expect(() =>
      responsibleAPI({
        partialDoc: {
          openapi: "3.1.0",
          info: { title: "t", version: "1" },
        },
        forEachOp: { req: { mime: "application/json" } },
        routes: {
          "/a/:id": GET({
            req: { pathParams: { id: string() } },
            res: { 200: object({}) },
          }),
          "/a/{id}": GET({
            req: { pathParams: { id: string() } },
            res: { 200: object({}) },
          }),
        },
      }),
    ).toThrow(/Duplicate operation/)
  })

  test("scope path defaults apply to current and nested path items", async () => {
    const Version = named(
      "version",
      headerParam({
        name: "X-Version",
        schema: string(),
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Scoped Params API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      routes: {
        "/users/:userId": scope({
          pathParams: { userId: int32() },
          params: [Version],
          GET: {
            res: { 200: object({}) },
          },
          "/logs": GET({
            res: { 200: object({}) },
          }),
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.paths?.["/users/{userId}"]?.parameters).toEqual([
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer", format: "int32" },
      },
      { $ref: "#/components/parameters/version" },
    ])
    expect(doc.paths?.["/users/{userId}"]?.get?.parameters).toBeUndefined()
    expect(doc.paths?.["/users/{userId}/logs"]?.parameters).toEqual([
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer", format: "int32" },
      },
      { $ref: "#/components/parameters/version" },
    ])
    expect(doc.paths?.["/users/{userId}/logs"]?.get?.parameters).toBeUndefined()
  })

  test("inherits forEachPath onto every nested path item", async () => {
    const Version = named(
      "version",
      headerParam({
        name: "X-Version",
        schema: string(),
      }),
    )

    const api = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: { title: "Scoped Path Defaults API", version: "1" },
      },
      forEachOp: { req: { mime: "application/json" } },
      forEachPath: {
        params: [Version],
      },
      routes: {
        "/users/:userId": scope({
          forEachPath: {
            pathParams: { userId: int32() },
          },
          GET: {
            res: { 200: object({}) },
          },
          "/logs": GET({
            res: { 200: object({}) },
          }),
        }),
      },
    })

    const doc = await validateDoc(api)

    expect(doc.paths?.["/users/{userId}"]?.parameters).toEqual([
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer", format: "int32" },
      },
      { $ref: "#/components/parameters/version" },
    ])
    expect(doc.paths?.["/users/{userId}"]?.get?.parameters).toBeUndefined()
    expect(doc.paths?.["/users/{userId}/logs"]?.parameters).toEqual([
      {
        name: "userId",
        in: "path",
        required: true,
        schema: { type: "integer", format: "int32" },
      },
      { $ref: "#/components/parameters/version" },
    ])
    expect(doc.paths?.["/users/{userId}/logs"]?.get?.parameters).toBeUndefined()
  })
})
