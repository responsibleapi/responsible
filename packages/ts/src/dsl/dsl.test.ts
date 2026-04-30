import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { validateDoc } from "../help/validate-doc.ts"
import { responsibleAPI } from "./dsl.ts"
import { POST } from "./methods.ts"
import { int32, object, string } from "./schema.ts"

const Err = object({ messsage: string() })

const SomeSuccess = object({ one: int32() })

describe("dsl", () => {
  test("tst", async () => {
    const rapi = responsibleAPI({
      partialDoc: {
        openapi: "3.1.0",
        info: {
          title: "HTTP benchmarks",
          version: "1",
        },
      },
      forEachOp: {
        req: { mime: "application/json" },
        res: {
          defaults: {
            "100..499": {
              mime: "application/json",
              headers: { "Content-Length": int32({ minimum: 1 }) },
            },
          },
          add: {
            400: {
              body: Err,
            },
          },
        },
      },
      routes: {
        "/map": POST({
          req: Err,
          res: {
            200: SomeSuccess,
          },
        }),
      },
    })

    expect(await validateDoc(rapi)).toEqual(rapi)

    expect(rapi).toEqual({
      openapi: "3.1.0",
      info: {
        title: "HTTP benchmarks",
        version: "1",
      },
      paths: {
        "/map": {
          post: {
            requestBody: {
              required: true,
              content: {
                ["application/json"]: {
                  schema: {
                    type: "object",
                    properties: {
                      messsage: {
                        type: "string",
                      },
                    },
                    required: ["messsage"],
                  },
                },
              },
            },
            responses: {
              ["200"]: {
                description: "200",
                headers: {
                  ["Content-Length"]: {
                    required: true,
                    schema: {
                      type: "integer",
                      format: "int32",
                      minimum: 1,
                    },
                  },
                },
                content: {
                  ["application/json"]: {
                    schema: {
                      type: "object",
                      properties: {
                        one: {
                          type: "integer",
                          format: "int32",
                        },
                      },
                      required: ["one"],
                    },
                  },
                },
              },
              ["400"]: {
                description: "400",
                headers: {
                  ["Content-Length"]: {
                    required: true,
                    schema: {
                      type: "integer",
                      format: "int32",
                      minimum: 1,
                    },
                  },
                },
                content: {
                  ["application/json"]: {
                    schema: {
                      type: "object",
                      properties: {
                        messsage: {
                          type: "string",
                        },
                      },
                      required: ["messsage"],
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
})
