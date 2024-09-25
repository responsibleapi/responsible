import { parse } from "kdljs"
import { OpenAPIV3 } from "openapi-types"
import { expect, test } from "vitest"
import { toValidOpenAPI } from "./kdl.test"
import { parseStruct } from "./schema"

test("struct field description", () => {
  const doc = parse(`
struct "LoginReq" {
  email "string" "email"
  password "string" minLength=8 description="ISO 27001"
}
`)

  const struct = parseStruct(doc.output![0])
  const password = struct.properties?.password as OpenAPIV3.SchemaObject
  expect(password.description).toEqual("ISO 27001")
})

test("struct extends", () => {
  const doc = toValidOpenAPI(`
enum "MemberRole" {
  admin
  editor
  viewer
}

struct "User" {
  id "UserID"
  email "email"
  name "string" minLength=1
  (?)avatar80 "httpURL"
}

struct "TeamMember" extends="User" {
  role "MemberRole"
}
`)

  expect(doc.components!.schemas!["TeamMember"]).toEqual({
    allOf: [
      { $ref: "#/components/schemas/User" },
      {
        type: "object",
        properties: {
          role: { $ref: "#/components/schemas/MemberRole" },
        },
        required: ["role"],
      },
    ],
  } satisfies OpenAPIV3.NonArraySchemaObject)
})

/** TODO */
test.todo("when all fields are optional required: should be omitted", () => {
  const doc = toValidOpenAPI(`
struct "User" {
  (?)id "UserID"
  (?)email "email"
  (?)name "string" minLength=1
  (?)avatar80 "httpURL"
}
`)
})
