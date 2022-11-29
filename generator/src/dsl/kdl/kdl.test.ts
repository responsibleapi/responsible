import OpenApiValidator from "openapi-schema-validator"
import { toOpenApi } from "../../openapi/to-open-api"
import { describe, expect, test } from "vitest"
import { OpenAPIV3 } from "openapi-types"
import { readFile } from "fs/promises"
import { kdlToCore } from "./kdl"
import { parse } from "kdljs"

describe.concurrent("kdl", () => {
  const clean = <T>(t: T): T => JSON.parse(JSON.stringify(t))

  const validate = (x: OpenAPIV3.Document): void =>
    expect(
      new OpenApiValidator({ version: 3 }).validate(clean(x)).errors,
    ).toEqual([])

  test("to core", async () => {
    validate(
      toOpenApi(
        kdlToCore(parse(await readFile("tryout/listenbox.kdl", "utf8")).output),
      ),
    )
  })

  test("yanic", async () => {
    const openapi = toOpenApi(
      kdlToCore(parse(await readFile("tryout/yanic.kdl", "utf8")).output),
    )
    expect(clean(openapi)).toEqual(
      JSON.parse(await readFile("tryout/yanic.json", "utf8")),
    )
    validate(openapi)
  })

  test("array", async () => {
    const openapi = toOpenApi(
      kdlToCore(parse(await readFile("tryout/testarray.kdl", "utf8")).output),
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
                headers: {},
              },
            },
          },
        },
      },
    })
  })
})
