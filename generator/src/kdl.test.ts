import OpenApiValidator from "openapi-schema-validator"
import { OpenAPIV3 } from "openapi-types"
import { readFile } from "fs/promises"
import { expect, test } from "vitest"
import { parseOpenAPI } from "./kdl"
import { parse } from "kdljs"

const toOpenAPI = (s: string): OpenAPIV3.Document => {
  const kdl = parse(s)

  expect(kdl.errors, JSON.stringify(kdl.errors, null, 2)).to.be.empty

  const doc = parseOpenAPI(kdl.output)

  const vld = new OpenApiValidator({ version: doc.openapi }).validate(doc)
  expect(vld.errors, JSON.stringify(vld.errors, null, 2)).to.be.empty

  return doc
}

test.concurrent("yanic JSON", async () => {
  expect(toOpenAPI(await readFile("tryout/yanic.kdl", "utf8"))).toEqual(
    JSON.parse(await readFile("tryout/yanic.json", "utf8")),
  )
})

test.concurrent("array", () => {
  const openapi = toOpenAPI(`
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

test.concurrent("kdl parse no errors", async () => {
  const texts = await Promise.all(
    ["listenbox", "yanic", "elkx", "youtube"].map(name =>
      readFile(`../generator/tryout/${name}.kdl`, "utf-8"),
    ),
  )

  for (const text of texts) {
    toOpenAPI(text)
  }
})

test.concurrent("query param names", () => {
  const { paths } = toOpenAPI(`
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
