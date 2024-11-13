import { Validator } from "@seriousme/openapi-schema-validator"
import { readdir, readFile } from "fs/promises"
import { parse } from "kdljs"
import type { oas31 } from "openapi3-ts"
import { join as pathJoin } from "path"
import { expect, test } from "vitest"
import { toOpenAPI } from "./kdl"

const openApiValidator = new Validator()

export const toValidOpenAPI = async (
  kdlStr: string,
): Promise<oas31.OpenAPIObject> => {
  const kdl = parse(kdlStr)
  expect(
    kdl.errors,
    `${JSON.stringify(kdl.errors, null, 2)}:
    ${kdlStr}`,
  ).toEqual([])

  const doc = toOpenAPI(kdl.output!)
  const vld = await openApiValidator.validate(doc)
  expect(
    vld.valid,
    `${JSON.stringify(vld.errors, null, 2)}:
     ${JSON.stringify(doc, null, 2)}`,
  ).toEqual(true)

  return doc
}

export const EXAMPLES_DIR = "../examples/"

test("array", async () => {
  const openapi = await toValidOpenAPI(`
type "ShowID" "string"

* {
    res {
        mime "application/json"
    }
}

GET "/user/:email(email)/shows" {
    name "showsByEmail"

    res {
        "200" "array" "ShowID"
    }
}
`)

  expect(openapi).toEqual({
    openapi: "3.1.0",
    info: {
      title: "",
      version: "",
    },
    components: {
      schemas: {
        ShowID: { type: "string" },
      },
    },
    paths: {
      "/user/{email}/shows": {
        get: {
          operationId: "showsByEmail",
          parameters: [
            {
              in: "path",
              name: "email",
              required: true,
              schema: { type: "string", format: "email" },
            },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/ShowID" },
                  },
                },
              },
              description: "200",
            },
          },
        },
      },
    },
  } satisfies oas31.OpenAPIObject)
})

test("kdl parse no errors", async () => {
  const files = await readdir(EXAMPLES_DIR)
  const texts = await Promise.all(
    files.map(file => readFile(pathJoin(EXAMPLES_DIR, file), "utf-8")),
  )

  for (const text of texts) {
    await toValidOpenAPI(text)
  }
})

test("query param names", async () => {
  const { paths } = await toValidOpenAPI(`
GET "/youtube/v3/search" {
    req {
        query {
            part "enum" {
                snippet
            }

            // Filters (specify 0 or 1 of the following parameters)
            (?)forContentOwner "boolean"
            (?)forDeveloper "boolean"
            (?)forMine "boolean"
            (?)relatedToVideoId "string" minLength=1

            (?)channelId "string" minLength=1
            (?)channelType "enum" {
                any
                show
            }
            (?)eventType "enum" {
                completed
                live
                upcoming
            }
        }
    }
    res {
        "200" "unknown"
    }
}
`)

  expect(paths!["/youtube/v3/search"]!.get!.parameters).toEqual([
    {
      in: "query",
      name: "part",
      required: true,
      schema: { type: "string", enum: ["snippet"] },
    },
    {
      in: "query",
      name: "forContentOwner",
      required: false,
      schema: { type: "boolean" },
    },
    {
      in: "query",
      name: "forDeveloper",
      required: false,
      schema: { type: "boolean" },
    },
    {
      in: "query",
      name: "forMine",
      required: false,
      schema: { type: "boolean" },
    },
    {
      in: "query",
      name: "relatedToVideoId",
      required: false,
      schema: { type: "string", minLength: 1 },
    },
    {
      in: "query",
      name: "channelId",
      required: false,
      schema: { type: "string", minLength: 1 },
    },
    {
      in: "query",
      name: "channelType",
      required: false,
      schema: { type: "string", enum: ["any", "show"] },
    },
    {
      in: "query",
      name: "eventType",
      required: false,
      schema: { type: "string", enum: ["completed", "live", "upcoming"] },
    },
  ] satisfies oas31.ParameterObject[])
})
