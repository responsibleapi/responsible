import { parse } from "kdljs"
import type { oas31 } from "openapi3-ts"
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
  const password = struct.properties?.password as oas31.SchemaObject
  expect(password.description).toEqual("ISO 27001")
})

test("struct extends", async () => {
  const doc = await toValidOpenAPI(`
enum "MemberRole" {
  admin
  editor
  viewer
}

type "UserID" "string"

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
  } satisfies oas31.SchemaObject)
})

/** TODO */
test.todo(
  "when all fields are optional required: should be omitted",
  async () => {
    const doc = await toValidOpenAPI(`
struct "User" {
  (?)id "UserID"
  (?)email "email"
  (?)name "string" minLength=1
  (?)avatar80 "httpURL"
}
`)
  },
)
