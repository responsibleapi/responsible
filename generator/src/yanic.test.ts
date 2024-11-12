import type { OpenAPIObject } from "openapi3-ts/oas31"
import { expect, test } from "vitest"

export const yanicJSON: Readonly<OpenAPIObject> = {
  openapi: "3.1.0",
  info: {
    title: "yanic",
    version: "1.0.0",
  },
  components: {
    schemas: {
      YtDlInfo: {
        type: "object",
      },
      YtDlOpts: {
        type: "object",
      },
      InfoReq: {
        type: "object",
        properties: {
          url: {
            type: "string",
            format: "uri",
            pattern: "^https?:\\/\\/\\S+$",
          },
          opts: {
            $ref: "#/components/schemas/YtDlOpts",
          },
        },
        required: ["url", "opts"],
      },
      DownloadReq: {
        type: "object",
        properties: {
          info: {
            $ref: "#/components/schemas/YtDlInfo",
          },
          opts: {
            $ref: "#/components/schemas/YtDlOpts",
          },
        },
        required: ["info", "opts"],
      },
    },
  },
  paths: {
    "/info": {
      post: {
        parameters: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/InfoReq",
              },
            },
          },
          required: true,
        },
        responses: {
          "200": {
            description: "200",
            headers: {
              "content-length": {
                required: true,
                schema: {
                  minimum: 1,
                  type: "integer",
                  format: "int32",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/YtDlInfo",
                },
              },
            },
          },
          "400": {
            description: "400",
            content: {
              "text/plain": {
                schema: {
                  minLength: 1,
                  type: "string",
                },
              },
            },
            headers: {
              "content-length": {
                required: true,
                schema: {
                  minimum: 1,
                  type: "integer",
                  format: "int32",
                },
              },
            },
          },
          "422": {
            description: "422",
            content: {
              "text/plain": {
                schema: {
                  minLength: 1,
                  type: "string",
                },
              },
            },
            headers: {
              "content-length": {
                required: true,
                schema: {
                  minimum: 1,
                  type: "integer",
                  format: "int32",
                },
              },
            },
          },
        },
      },
    },
    "/download": {
      post: {
        parameters: [],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DownloadReq",
              },
            },
          },
          required: true,
        },
        responses: {
          "200": {
            description: "200",
            headers: {
              "content-length": {
                required: true,
                schema: {
                  minimum: 1,
                  type: "integer",
                  format: "int32",
                },
              },
            },
          },
          "400": {
            description: "400",
            content: {
              "text/plain": {
                schema: {
                  minLength: 1,
                  type: "string",
                },
              },
            },
            headers: {
              "content-length": {
                required: true,
                schema: {
                  minimum: 1,
                  type: "integer",
                  format: "int32",
                },
              },
            },
          },
          "422": {
            description: "422",
            content: {
              "text/plain": {
                schema: {
                  minLength: 1,
                  type: "string",
                },
              },
            },
            headers: {
              "content-length": {
                required: true,
                schema: {
                  minimum: 1,
                  type: "integer",
                  format: "int32",
                },
              },
            },
          },
        },
      },
    },
  },
}

test("yanic", () => {
  expect(1).toEqual(1)
})
