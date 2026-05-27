import type { Schema } from "../index.ts"
import {
  POST,
  anyOf,
  array,
  boolean,
  httpSecurity,
  int64,
  integer,
  named,
  object,
  oneOf,
  resp,
  responsibleAPI,
  sse,
  string,
  unknown,
} from "../index.ts"

const bearerAuth = named(
  "bearerAuth",
  httpSecurity({
    scheme: "bearer",
    bearerFormat: "OpenAI API key",
  }),
)

const inputText = object({
  type: string({ const: "input_text" }),
  text: string(),
})

const inputContent = anyOf([string(), array(inputText)])

const responseInputMessage = object({
  role: string({ enum: ["developer", "system", "user", "assistant"] }),
  content: inputContent,
})

const createStreamingResponseRequest = object({
  model: string({
    examples: ["gpt-5.4"],
  }),
  input: anyOf([string(), array(responseInputMessage)]),
  "instructions?": string(),
  stream: boolean({
    default: true,
    description: "Set to true to receive server-sent events.",
  }),
})

const response = named(
  "Response",
  object({
    id: string(),
    object: string({ const: "response" }),
    created_at: int64(),
    status: string({
      enum: [
        "queued",
        "in_progress",
        "completed",
        "failed",
        "cancelled",
        "incomplete",
      ],
    }),
    "model?": string(),
    "output?": array(unknown()),
    "usage?": unknown(),
  }),
)

const responseLifecycleEventData = (type: string) =>
  object({
    type: string({ const: type }),
    response,
    "sequence_number?": integer(),
  })

const responseOutputTextDeltaData = object({
  type: string({ const: "response.output_text.delta" }),
  item_id: string(),
  output_index: integer(),
  content_index: integer(),
  delta: string(),
  "sequence_number?": integer(),
})

const responseOutputTextDoneData = object({
  type: string({ const: "response.output_text.done" }),
  item_id: string(),
  output_index: integer(),
  content_index: integer(),
  text: string(),
  "sequence_number?": integer(),
})

const responseOutputItemAddedData = object({
  type: string({ const: "response.output_item.added" }),
  output_index: integer(),
  item: unknown(),
  "sequence_number?": integer(),
})

const responseOutputItemDoneData = object({
  type: string({ const: "response.output_item.done" }),
  output_index: integer(),
  item: unknown(),
  "sequence_number?": integer(),
})

const responseContentPartAddedData = object({
  type: string({ const: "response.content_part.added" }),
  item_id: string(),
  output_index: integer(),
  content_index: integer(),
  part: unknown(),
  "sequence_number?": integer(),
})

const responseContentPartDoneData = object({
  type: string({ const: "response.content_part.done" }),
  item_id: string(),
  output_index: integer(),
  content_index: integer(),
  part: unknown(),
  "sequence_number?": integer(),
})

const errorEventData = object({
  type: string({ const: "error" }),
  message: string(),
  "code?": string(),
  "param?": string(),
  "sequence_number?": integer(),
})

const sseJSONEvent = (event: string, contentSchema: Schema) =>
  object({
    event: string({ const: event }),
    data: string({
      contentMediaType: "application/json",
      contentSchema,
    }),
    "id?": string(),
    "retry?": integer({ minimum: 0 }),
  })

const ResponseStreamEvent = () =>
  oneOf([
    sseJSONEvent(
      "response.created",
      responseLifecycleEventData("response.created"),
    ),
    sseJSONEvent(
      "response.in_progress",
      responseLifecycleEventData("response.in_progress"),
    ),
    sseJSONEvent(
      "response.completed",
      responseLifecycleEventData("response.completed"),
    ),
    sseJSONEvent("response.output_item.added", responseOutputItemAddedData),
    sseJSONEvent("response.output_item.done", responseOutputItemDoneData),
    sseJSONEvent("response.content_part.added", responseContentPartAddedData),
    sseJSONEvent("response.content_part.done", responseContentPartDoneData),
    sseJSONEvent("response.output_text.delta", responseOutputTextDeltaData),
    sseJSONEvent("response.output_text.done", responseOutputTextDoneData),
    sseJSONEvent("error", errorEventData),
  ])

export default responsibleAPI({
  partialDoc: {
    openapi: "3.2.0",
    info: {
      title: "OpenAI Responses Streaming",
      version: "1",
    },
    servers: [
      {
        url: "https://api.openai.com/v1",
      },
    ],
  },
  security: bearerAuth,
  forEachOp: {
    req: {
      mime: "application/json",
    },
  },
  routes: {
    "/responses": POST("createStreamingResponse", {
      summary: "Create a streaming model response",
      req: createStreamingResponseRequest,
      res: {
        200: resp({
          description: "A server-sent event stream of response events.",
          body: sse(ResponseStreamEvent),
        }),
      },
    }),
  },
})
