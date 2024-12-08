import type { oas31 } from "openapi3-ts"
import { describe, expect, test } from "vitest"
import { toValidOpenAPI } from "./kdl.test"

describe("scope", () => {
  test("* is applied", async () => {
    const doc = await toValidOpenAPI(`
* {
    res {
        "400" "unknown"

        * {
            (?)header "Content-Type" "string" minLength=1
        }

        "200..299" {
            header "Content-Length" "string" minLength=1
        }
    }
}

GET "/health" {
    res {
        "200" "unknown"
    }
}
`)

    const getHealth = doc.paths?.["/health"].get

    expect(getHealth).toEqual({
      responses: {
        200: {
          description: "200",
          headers: {
            "content-length": {
              required: true,
              schema: {
                type: "string",
                minLength: 1,
              },
            },
            "content-type": {
              required: false,
              schema: {
                type: "string",
                minLength: 1,
              },
            },
          },
        } satisfies oas31.ResponseObject,
        400: {
          description: "400",
          headers: {
            "content-type": {
              required: false,
              schema: {
                type: "string",
                minLength: 1,
              },
            },
          },
        } satisfies oas31.ResponseObject,
      },
    } satisfies oas31.OperationObject)
  })
})
