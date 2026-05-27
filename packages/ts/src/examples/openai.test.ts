import { describe, expect, test } from "vitest"
import openaiAPI from "./openai.ts"

describe("openai", () => {
  test("models Responses streaming with OpenAPI 3.2 SSE itemSchema", () => {
    expect(openaiAPI.openapi).toEqual("3.2.0")
    expect(openaiAPI.paths?.["/responses"]?.post?.responses?.["200"]).toEqual({
      description: "A server-sent event stream of response events.",
      content: {
        "text/event-stream": {
          itemSchema: {
            $ref: "#/components/schemas/ResponseStreamEvent",
          },
        },
      },
    })
  })
})
