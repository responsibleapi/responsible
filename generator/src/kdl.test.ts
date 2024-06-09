import { readdir, readFile } from "fs/promises"
import { parse } from "kdljs"
import OpenAPISchemaValidator from "openapi-schema-validator"
import { OpenAPIV3 } from "openapi-types"
import { join as pathJoin } from "path"
import { expect, test } from "vitest"
import { parseOpenAPI } from "./kdl"
import { yanicJSON } from "./yanic.test"

export const toValidOpenAPI = (kdlStr: string): OpenAPIV3.Document => {
  const kdl = parse(kdlStr)
  expect(kdl.errors, JSON.stringify(kdl.errors, null, 2)).toEqual([])

  const doc = parseOpenAPI(kdl.output)
  const vld = new OpenAPISchemaValidator({ version: doc.openapi }).validate(doc)
  expect(vld.errors, JSON.stringify(vld.errors, null, 2)).toEqual([])

  return doc
}

const EXAMPLES_DIR = "../examples/"

test("yanic JSON", async () => {
  expect(
    toValidOpenAPI(await readFile(pathJoin(EXAMPLES_DIR, "yanic.kdl"), "utf8")),
  ).toEqual(yanicJSON)
})

test("array", () => {
  const openapi = toValidOpenAPI(`
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

  expect(openapi).toEqual(<OpenAPIV3.Document>{
    openapi: "3.0.1",
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
  })
})

test("kdl parse no errors", async () => {
  const files = await readdir(EXAMPLES_DIR)
  const texts = await Promise.all(
    files.map(file => readFile(pathJoin(EXAMPLES_DIR, file), "utf-8")),
  )

  for (const text of texts) {
    toValidOpenAPI(text)
  }
})

test("query param names", () => {
  const { paths } = toValidOpenAPI(`
GET "/youtube/v3/search" {
    req {
        query {
            part "string" enum="snippet"

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
}
`)

  expect(paths["/youtube/v3/search"].get.parameters).toEqual(<
    OpenAPIV3.ParameterObject[]
  >[
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
  ])
})
