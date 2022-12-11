import OpenApiValidator from "openapi-schema-validator"
import { OpenAPIV3 } from "openapi-types"
import { readFile } from "fs/promises"
import { expect, test } from "vitest"
import { parseOpenAPI } from "./kdl"
import { parse } from "kdljs"

const clean = <T>(t: T): T => JSON.parse(JSON.stringify(t))

const validate = (x: OpenAPIV3.Document): void => {
  const { errors } = new OpenApiValidator({ version: 3 }).validate(clean(x))

  expect(errors, JSON.stringify(x, null, 2) + JSON.stringify(errors, null, 2))
    .to.be.empty
}

test.concurrent("yanic JSON", async () => {
  expect(
    clean(
      parseOpenAPI(parse(await readFile("tryout/yanic.kdl", "utf8")).output),
    ),
  ).toEqual(JSON.parse(await readFile("tryout/yanic.json", "utf8")))
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

test.concurrent("kdl parse no errors", async () => {
  const texts = await Promise.all(
    ["listenbox", "yanic", "elkx", "youtube"].map(name =>
      readFile(`../generator/tryout/${name}.kdl`, "utf-8"),
    ),
  )

  for (const text of texts) {
    const { errors, output } = parse(text)
    expect(errors, JSON.stringify(errors, null, 2)).to.be.empty

    validate(parseOpenAPI(output))
  }
})
