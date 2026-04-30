import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"

import { object, string, unknown } from "../dsl/schema.ts"
import { canonical } from "./canonical.ts"

describe("normalize", () => {
  test("sorts validation-relevant arrays without mutating the original document", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: {
        title: "Example",
        version: "1.0.0",
      },
      paths: {
        "/items": {
          get: {
            parameters: [
              {
                name: "beta",
                in: "query",
                required: false,
                schema: {
                  enum: ["zeta", "alpha"],
                  type: ["string", "null"],
                },
              },
              {
                name: "alpha",
                in: "query",
                required: false,
                schema: {
                  enum: ["gamma", "beta"],
                  type: ["integer", "null"],
                },
              },
            ],
            responses: {
              200: {
                description: "ok",
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Example: {
            required: ["delta", "alpha", "charlie"],
          },
        },
      },
    }

    const normalized = canonical(doc)

    expect(normalized).not.toBe(doc)
    expect(normalized.info).not.toBe(doc.info)
    expect(normalized.paths).not.toBe(doc.paths)
    expect(normalized.paths?.["/items"]).not.toBe(doc.paths?.["/items"])
    expect(normalized.components).not.toBe(doc.components)
    expect(normalized.components?.schemas).not.toBe(doc.components?.schemas)

    expect(normalized).toMatchObject({
      paths: {
        "/items": {
          get: {
            parameters: [
              {
                name: "alpha",
                in: "query",
                schema: {
                  enum: ["beta", "gamma"],
                  type: ["integer", "null"],
                },
              },
              {
                name: "beta",
                in: "query",
                schema: {
                  enum: ["alpha", "zeta"],
                  type: ["null", "string"],
                },
              },
            ],
          },
        },
      },
      components: {
        schemas: {
          Example: {
            required: ["alpha", "charlie", "delta"],
          },
        },
      },
    })

    expect(doc).toMatchObject({
      paths: {
        "/items": {
          get: {
            parameters: [
              {
                name: "beta",
                in: "query",
                required: false,
                schema: {
                  enum: ["zeta", "alpha"],
                  type: ["string", "null"],
                },
              },
              {
                name: "alpha",
                in: "query",
                required: false,
                schema: {
                  enum: ["gamma", "beta"],
                  type: ["integer", "null"],
                },
              },
            ],
          },
        },
      },
      components: {
        schemas: {
          Example: {
            required: ["delta", "alpha", "charlie"],
          },
        },
      },
    })
  })

  test("leaves documents without paths unchanged at path-item merge step", () => {
    const doc = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
    } as oas31.OpenAPIObject

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
    })
  })

  test("skips path items that are not objects or have no parameters array", () => {
    const doc = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/plain": {
          get: {
            responses: { 200: { description: "ok" } },
          },
        },
        "/bad": "not-a-path-item" as unknown as oas31.PathItemObject,
      },
    } as oas31.OpenAPIObject

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/plain": {
          get: {
            responses: { 200: { description: "ok" } },
          },
        },
        "/bad": "not-a-path-item" as unknown as oas31.PathItemObject,
      },
    })
  })

  test("treats explicit empty operation parameters arrays as absent", () => {
    const withEmpty: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items": {
          post: {
            operationId: "createItem",
            parameters: [],
            responses: { 201: { description: "created" } },
          },
        },
      },
    }

    const withoutEmpty: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items": {
          post: {
            operationId: "createItem",
            responses: { 201: { description: "created" } },
          },
        },
      },
    }

    expect(canonical(withEmpty)).toEqual(canonical(withoutEmpty))
  })

  test("preserves component parameter refs and parameter components", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            parameters: [{ $ref: "#/components/parameters/page" }],
            responses: { 200: { description: "ok" } },
          },
        },
      },
      components: {
        parameters: {
          page: {
            name: "page",
            in: "query",
            required: false,
            style: "form",
            explode: true,
            schema: { type: "integer", format: "int32" },
          },
        },
      },
    }

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            parameters: [{ $ref: "#/components/parameters/page" }],
            responses: { 200: { description: "ok" } },
          },
        },
      },
      components: {
        parameters: {
          page: {
            name: "page",
            in: "query",
            style: "form",
            explode: true,
            schema: { type: "integer", format: "int32" },
          },
        },
      },
    })
  })

  test("preserves path-item parameters when no operations inherit them", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items/{id}": {
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
        },
      },
    }

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items/{id}": {
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
        },
      },
    })
  })

  test("preserves description strings verbatim", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {},
      "x-desc": {
        description:
          "ID of the Google+ Page for the channel that the request is be on behalf of",
      },
    }

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {},
      "x-desc": {
        description:
          "ID of the Google+ Page for the channel that the request is be on behalf of",
      },
    })
  })

  test("normalizes validation-equivalent shapes when no unevaluatedProperties depends on them", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            deprecated: false,
            responses: {
              200: {
                description: "ok",
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Primitive: {
            type: "integer",
            description: "strip me",
          },
          Pattern: {
            type: "string",
            pattern: "^https?:\\/\\/\\S+$",
          },
          EmptyProps: {
            type: "object",
            properties: {},
          },
          EmptyAdditionalPropsWithoutUnevaluated: {
            type: "object",
            additionalProperties: {},
          },
          RequiredOnly: {
            required: ["b", "a"],
          },
          EmptyRequired: {
            type: "object",
            properties: {
              maybe: { type: "string" },
            },
            required: [],
          },
          NullExamples: {
            type: ["string", "null"],
            examples: [null],
          },
        },
        requestBodies: {
          Body: {
            content: {
              "application/json": {
                schema: { type: "string" },
              },
            },
            required: true,
          },
        },
        parameters: {
          OptionalQuery: {
            in: "query",
            name: "q",
            required: false,
            style: "form",
            explode: true,
            schema: { type: "string" },
          },
        },
      },
    }

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: {
              200: {
                description: "ok",
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Primitive: {
            type: "integer",
            description: "strip me",
          },
          Pattern: {
            type: "string",
            pattern: "^https?://\\S+$",
          },
          EmptyProps: {
            type: "object",
          },
          EmptyAdditionalPropsWithoutUnevaluated: {
            type: "object",
          },
          RequiredOnly: {
            required: ["a", "b"],
          },
          EmptyRequired: {
            type: "object",
            properties: {
              maybe: { type: "string" },
            },
          },
          NullExamples: {
            type: ["null", "string"],
            examples: [null],
          },
        },
        requestBodies: {
          Body: {
            content: {
              "application/json": {
                schema: { type: "string" },
              },
            },
            required: true,
          },
        },
        parameters: {
          OptionalQuery: {
            in: "query",
            name: "q",
            style: "form",
            explode: true,
            schema: { type: "string" },
          },
        },
      },
    })
  })

  test("sorts required-only allOf shards without inventing object structure", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "normalize shard", version: "1" },
      paths: {},
      components: {
        schemas: {
          UnderTest: {
            allOf: [
              { $ref: "#/components/schemas/category" },
              { required: ["title", "slug"] },
            ],
          } as oas31.SchemaObject,
          category: object({
            slug: string(),
            title: unknown(),
          }) as oas31.SchemaObject,
        },
      },
    }

    expect(canonical(doc)).toEqual<oas31.OpenAPIObject>({
      openapi: "3.1.0",
      info: { title: "normalize shard", version: "1" },
      paths: {},
      components: {
        schemas: {
          UnderTest: {
            allOf: [
              { $ref: "#/components/schemas/category" },
              { required: ["slug", "title"] },
            ],
          } as oas31.SchemaObject,
          category: object({
            slug: string(),
            title: unknown(),
          }) as oas31.SchemaObject,
        },
      },
    })
  })

  test("sorts security requirement arrays and canonicalizes scopes", () => {
    const doc: oas31.OpenAPIObject = {
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {},
      security: [{ b: ["z", "a"], a: [] }, {}, { oauth2: ["read", "write"] }],
    }

    expect(canonical(doc)).toEqual({
      openapi: "3.1.0",
      info: { title: "Example", version: "1.0.0" },
      paths: {},
      security: [{ a: [], b: ["a", "z"] }, { oauth2: ["read", "write"] }, {}],
    })
  })
})
