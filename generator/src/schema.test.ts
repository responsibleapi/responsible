import { parse } from "kdljs"
import { OpenAPIV3 } from "openapi-types"
import { expect, test } from "vitest"
import { parseStruct } from "./schema"

test("struct field description", () => {
  const doc = parse(`
struct "LoginReq" {
  email "string" "email"
  password "string" minLength=8 description="ISO 27001"
}
`)

  const struct = parseStruct(doc.output[0])
  const password = struct.properties?.password as OpenAPIV3.SchemaObject
  expect(password.description).toEqual("ISO 27001")
})
