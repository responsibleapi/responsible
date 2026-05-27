# LLM SSE Follow-Up Plan

## Current State

- The compiler can already emit OpenAPI `3.2.0` `text/event-stream` responses.
- `sse(itemSchema)` emits a media type object with `itemSchema`.
- `@seriousme/openapi-schema-validator` validates the generated OpenAPI 3.2
  document.
- The OpenAI streaming example compiles and validates against
  [`openai.yaml`](../../src/examples/openai.yaml).

The remaining problem is DSL ergonomics.

[`openai.ts`](../../src/examples/openai.ts) currently makes authors model the
SSE wire envelope themselves:

```ts
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
```

That is conformant, but it is the wrong public abstraction for LLM APIs.

## Why It Feels Wrong

OpenAPI 3.2 has two layers for SSE:

- `itemSchema` describes each parsed SSE event item.
- SSE `data` is still a string field at the wire layer.
- JSON inside `data` is described with `contentMediaType: application/json`
  and `contentSchema`.

That matches the spec, but it should not leak into everyday DSL code.

For OpenAI-style streams, authors think in semantic events:

```ts
object({
  type: string({ const: "response.output_text.delta" }),
  item_id: string(),
  output_index: integer(),
  content_index: integer(),
  delta: string(),
  "sequence_number?": integer(),
})
```

They do not think in:

- `event: ...`
- `data: string(...)`
- `contentMediaType`
- `contentSchema`
- JSON serialized inside an SSE text field

The DSL should accept parsed semantic event schemas and let the compiler produce
the OpenAPI 3.2 SSE envelope.

## Target DSL Shape

The example should move toward this shape:

```ts
const ResponseStreamEvent = () =>
  oneOf([
    responseLifecycleEventData("response.created"),
    responseLifecycleEventData("response.in_progress"),
    responseLifecycleEventData("response.completed"),
    responseOutputItemAddedData,
    responseOutputItemDoneData,
    responseContentPartAddedData,
    responseContentPartDoneData,
    responseOutputTextDeltaData,
    responseOutputTextDoneData,
    errorEventData,
  ])

export default responsibleAPI({
  partialDoc: {
    openapi: "3.2.0",
    info: {
      title: "OpenAI Responses Streaming",
      version: "1",
    },
  },
  routes: {
    "/responses": POST("createStreamingResponse", {
      req: createStreamingResponseRequest,
      res: {
        200: resp({
          description: "A server-sent event stream of response events.",
          body: sseJSON(ResponseStreamEvent),
        }),
      },
    }),
  },
})
```

The exact helper name is open. The important part is the contract:

- input schema is the parsed semantic event object
- every event variant has a `type` field
- compiler emits the SSE envelope
- generated OpenAPI remains spec-conformant

## Generated OpenAPI Target

The generated YAML can keep the current conformant shape:

```yaml
content:
  text/event-stream:
    itemSchema:
      $ref: "#/components/schemas/ResponseStreamEvent"
components:
  schemas:
    ResponseStreamEvent:
      oneOf:
        - type: object
          properties:
            event:
              type: string
              const: response.created
            data:
              type: string
              contentMediaType: application/json
              contentSchema:
                $ref: "#/components/schemas/ResponseCreatedData"
```

But authors should only write `ResponseCreatedData`.

## Compiler Responsibility

For a semantic event schema, the compiler should build the SSE item schema:

```ts
object({
  event: string({ const: eventType }),
  data: string({
    contentMediaType: "application/json",
    contentSchema: semanticEventSchema,
  }),
  "id?": string(),
  "retry?": integer({ minimum: 0 }),
})
```

The event name can be inferred from the semantic event object's
`type.const`.

If inference fails, the DSL should throw a clear error:

- missing `type`
- `type` is not a string schema
- missing `type.const`
- duplicate or incompatible event type variants

## Design Direction

Add a higher-level SSE helper instead of changing all body handling.

Possible shape:

```ts
export const sseJSON = (
  eventSchema: Schema,
): Record<"text/event-stream", ServerSentEventStream>
```

The existing low-level `sse(itemSchema)` can remain as an escape hatch for
non-JSON SSE, custom envelope modeling, or non-OpenAI-style streams.

`sseJSON()` would:

- accept parsed semantic event schema
- wrap it into SSE envelope item schema
- require each event variant to expose `type.const`
- emit `event: <type>` and JSON `data`
- hide `contentMediaType` and `contentSchema` from user examples

## Implementation Steps

1. Add internal schema inspection for event `type.const`.
2. Add a helper that converts semantic event schemas to SSE envelope schemas.
3. Export the helper from [`src/index.ts`](../../src/index.ts).
4. Rewrite [`openai.ts`](../../src/examples/openai.ts) to remove
   `sseJSONEvent()`.
5. Keep [`openai.yaml`](../../src/examples/openai.yaml) stable unless a better
   component factoring naturally falls out.
6. Add tests for missing or invalid event `type.const`.

## Acceptance Criteria

- Example authors define only parsed semantic event objects.
- No example code mentions `contentMediaType: "application/json"`.
- No example code mentions `contentSchema`.
- No example code manually builds SSE `event` / `data` wrappers.
- Generated YAML remains valid OpenAPI 3.2.
- `openai.yaml` still models SSE `data` as JSON-encoded string, because that is
  the spec-conformant wire shape.

## Non-Goals

- Do not remove `sse(itemSchema)` yet.
- Do not switch the OpenAI example to JSONL or NDJSON.
- Do not pretend SSE `data` is a JSON object on the wire.
- Do not add broad OpenAPI 3.2 support beyond this streaming path.

## References

- [OpenAPI Specification v3.2.0](https://spec.openapis.org/oas/v3.2.0.html)
- [OpenAI Responses streaming events](https://platform.openai.com/docs/api-reference/responses-streaming)
- [openai-node streaming parser](https://github.com/openai/openai-node/blob/master/src/core/streaming.ts)
