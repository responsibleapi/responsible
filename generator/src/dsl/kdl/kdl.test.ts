import OpenApiValidator from "openapi-schema-validator"
import { OpenAPIV3 } from "openapi-types"
import { readFile } from "fs/promises"
import { expect, test } from "vitest"
import { parseOpenAPI } from "./kdl"
import { parse } from "kdljs"

const clean = <T>(t: T): T => JSON.parse(JSON.stringify(t))

const validate = (x: OpenAPIV3.Document): void => {
  const { errors } = new OpenApiValidator({ version: 3 }).validate(clean(x))

  return expect(
    errors,
    JSON.stringify(x, null, 2) + JSON.stringify(errors, null, 2),
  ).toEqual([])
}

test.concurrent("listenbox.kdl to OpenAPI", async () => {
  validate(
    parseOpenAPI(parse(await readFile("tryout/listenbox.kdl", "utf8")).output),
  )
})

test.concurrent("yanic", async () => {
  const openapi = parseOpenAPI(
    parse(await readFile("tryout/yanic.kdl", "utf8")).output,
  )
  expect(clean(openapi)).toEqual(
    JSON.parse(await readFile("tryout/yanic.json", "utf8")),
  )
  validate(openapi)
})

test.concurrent("array", async () => {
  const openapi = parseOpenAPI(
    parse(await readFile("tryout/testarray.kdl", "utf8")).output,
  )

  expect(clean(openapi)).toEqual(<OpenAPIV3.Document>{
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
