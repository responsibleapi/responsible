import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { kdl, toValidOpenAPI } from "./kdl.test"
import { parseStruct } from "./schema"

describe("schema", () => {
  test("struct field description", () => {
    const struct = parseStruct(
      kdl`
    struct "LoginReq" {
      email "string" "email"
      password "string" minLength=8 description="ISO 27001"
    }
    `.output![0],
    )
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

  test("when all fields are optional required: should be omitted", async () => {
    const doc = await toValidOpenAPI(`
type "UserID" "string"
    
struct "User" {
  (?)id "UserID"
  (?)email "email"
  (?)name "string" minLength=1
  (?)avatar80 "httpURL"
}
`)
    expect(Object.keys(doc.components!.schemas!["User"])).toEqual([
      "type",
      "properties",
    ])
  })
})
