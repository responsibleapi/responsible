import type { oas31 } from "openapi3-ts"
import { expect, test } from "vitest"
import { describe } from "./__tests__/describe"
import { mkAjv } from "./common"

describe("common", () => {
  test("ajv", () => {
    const ajv = mkAjv({
      openapi: "3.1.0",
      info: { title: "test", version: "1.0.0" },
    })

    const validate = ajv.compile({
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
        name: { type: "string", minLength: 1 },
        role: {
          type: "string",
          enum: ["admin", "read"],
        },
      },
      required: ["id", "email", "name", "role"],
    } satisfies oas31.SchemaObject)

    expect(validate({})).toEqual(false)
    expect(validate.errors).toEqual([
      {
        instancePath: "",
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "id" },
      },
      {
        instancePath: "",
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "email" },
      },
      {
        instancePath: "",
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "name" },
      },
      {
        instancePath: "",
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: "role" },
      },
    ])
  })
})
