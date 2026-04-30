# LLM SSE Plan

## Goal

- Document why OpenAPI 3.2 matters for LLM-style streaming APIs.
- Identify exact gaps between current `responsibleapi` output and OpenAPI 3.2
  sequential media types.
- Outline minimal-risk path to support `text/event-stream` and related formats
  without mixing plan work into unrelated compiler changes.

## Why This Matters

- Many LLM APIs stream output incrementally rather than returning one final JSON
  document.
- Common wire formats include:
  - `text/event-stream` for Server-Sent Events
  - `application/jsonl`
  - `application/x-ndjson`
  - `multipart/mixed`
- OpenAPI 3.1 can declare `text/event-stream` as response media type, but it
  cannot standardly describe response-side SSE item contracts:
  - 3.1 `Media Type Object` has `schema`, `example`, `examples`, and
    request-only `encoding`
  - 3.1 has no `itemSchema`, no sequential-media model, and no SSE-specific
    response framing fields
  - 3.1 `schema` applies to complete content, which is wrong abstraction for
    open-ended per-item streams
- OpenAPI 3.2 adds sequential media types and `itemSchema`, which is exact
  missing primitive for streamed item-by-item contracts.

## Current Repo State

- Repo emits OpenAPI `3.1.0` today.
- README says compiler targets OpenAPI `3.1.0`.
- Current response/request body DSL shape is schema-first:
  - [`src/dsl/operation.ts`](../../src/dsl/operation.ts)
  - `body?: Schema | Record<Mime, Schema>`
- Current compiler content emission is schema-only per media type:
  - [`src/compiler/index.ts`](../../src/compiler/index.ts)
  - `compileContent()` returns `{ schema }` entries, not richer media type
    objects.
- This means current output can express:
  - media type name
  - single body schema
- Current output cannot express OpenAPI 3.2 sequential-media fields such as:
  - `itemSchema`
  - item-by-item multipart encoding
  - richer streaming examples tied to item structure

## What OpenAPI 3.2 Adds For LLM APIs

- First-class sequential media types, including `text/event-stream`.
- `itemSchema` on a Media Type Object for each streamed item/event.
- Clear split between:
  - `schema` for complete content
  - `itemSchema` for each streamed item
- Better examples for serialized streaming payloads.
- More accurate docs and codegen for APIs that emit event unions such as:
  - text deltas
  - tool call deltas
  - progress events
  - terminal `done` events
  - error events

## Real-World HTTP API Examples

- OpenAI Responses API already treats streaming as an event union, not one final
  JSON document:
  - request uses `stream: true`
  - response uses SSE with semantic event types such as `response.created`,
    `response.output_text.delta`, `response.completed`, and `error`
  - each emitted item has distinct lifecycle meaning and shape
- Anthropic Messages API uses named SSE events and richer per-item variants:
  - request uses `stream: true`
  - response emits `event: message_start`, `event: content_block_start`,
    repeated `event: content_block_delta`, `event: message_delta`,
    `event: message_stop`, plus `ping` and `error`
  - tool streaming adds `input_json_delta`; thinking mode adds `thinking_delta`
    and `signature_delta`
  - text deltas, tool deltas, pings, and terminal events are structurally
    different items
- Kimi K2.5 exposes real SSE over plain HTTP on `POST /v1/chat/completions`:
  - request uses `stream: true`
  - response switches from `application/json` to `text/event-stream`
  - each item is `data: { ... }`, usually with `object: "chat.completion.chunk"`
    and incremental `choices[0].delta.content`
  - terminal sequence is final chunk with `finish_reason` and `usage`, then
    `data: [DONE]`
  - relevant because it stays close to OpenAI-compatible chat completions while
    still relying on sequential wire items
- Practical conclusion:
  - providers do not converge on one streaming item shape
  - some streams use named SSE events
  - some use data-only SSE chunks with typed JSON payloads
  - some append non-JSON sentinels such as `[DONE]`
  - single-response `schema` is not enough to describe these contracts

## Why OpenAPI 3.1 Is Not Enough

- This is not “hard to express”; it is missing from standard OAS 3.1.
- OAS 3.1 can describe:
  - response media type `text/event-stream`
  - examples and prose
  - vendor extensions
- OAS 3.1 cannot standardly describe:
  - schema for each SSE item in a response stream
  - union of distinct streamed event shapes as per-item contract
  - response-side SSE framing such as named `event:` blocks versus data-only
    chunks
- Reason:
  - 3.1 `Media Type Object` has no `itemSchema`
  - 3.1 `encoding` only applies to `requestBody` with `multipart` or
    `application/x-www-form-urlencoded`
  - 3.1 has no sequential media type model, while 3.2 adds one explicitly
- Therefore:
  - in 3.1, SSE can only be approximated with prose, examples, or non-standard
    extensions
  - in 3.2, SSE item contracts become first-class via `itemSchema`

## Example Target

- A future LLM response endpoint should be able to describe a response like:
  - media type `text/event-stream`
  - each event item validated against a schema or schema union
  - non-streaming variant still available under `application/json`
- Conceptually, OpenAPI 3.2 shape looks like:

```yaml
responses:
  "200":
    description: Streamed LLM output
    content:
      text/event-stream:
        itemSchema:
          oneOf:
            - $ref: "#/components/schemas/ResponseTextDeltaEvent"
            - $ref: "#/components/schemas/ResponseToolCallDeltaEvent"
            - $ref: "#/components/schemas/ResponseCompletedEvent"
            - $ref: "#/components/schemas/ErrorEvent"
```

## Compiler Gap

- Current DSL assumes each media type maps to one complete schema.
- Streaming needs one more layer:
  - complete payload schema for non-streaming content
  - item schema for sequential content
- Current compiler path likely affected:
  - [`src/dsl/operation.ts`](../../src/dsl/operation.ts)
  - [`src/dsl/scope.ts`](../../src/dsl/scope.ts)
  - [`src/compiler/index.ts`](../../src/compiler/index.ts)
  - [`src/compiler/response.test.ts`](../../src/compiler/response.test.ts)
  - [`src/compiler/request.test.ts`](../../src/compiler/request.test.ts) if
    request streaming ever matters

## Design Constraints

- Any change to `@dsl` signatures needs human approval first.
- Compiler should not claim OpenAPI `3.2.0` until emitted document shape is
  actually 3.2-aware.
- 3.1 behavior must remain stable for existing examples and tests.
- Avoid repo-wide migration until there is one concrete streaming use case or
  golden example worth protecting.

## Suggested Plan

### 1. Decide Version Strategy First

- Choose between:
  - keep compiler default on `3.1.0` and add later 3.2 mode
  - move compiler baseline to `3.2.0`
- Recommendation:
  - keep current default on `3.1.0` first
  - prototype 3.2 support behind an explicit opt-in path
- Reason:
  - existing tests and fixtures assume `3.1.0`
  - toolchain support for 3.2 will lag 3.1 for some time

### 2. Separate Internal Media Type Model From Public DSL

- Refactor compiler content assembly so one internal representation can emit:
  - `schema`
  - `itemSchema`
  - later media-type-specific encoding fields
- Do this before touching public DSL signatures.
- Reason:
  - keeps migration smaller
  - reduces risk of redesigning `@dsl` surface twice

### 3. Define Streaming DSL Shape

- Only after approval for `@dsl` edits.
- Possible direction:
  - keep existing `body` for complete payloads
  - add separate explicit streaming body field rather than overloading `body`
- Favor explicitness over “magic if mime is `text/event-stream`”.
- Reason:
  - `application/jsonl` and `multipart/mixed` have similar needs
  - explicit streaming intent is easier to compile and review

### 4. Add Focused Compiler Tests

- Add response tests covering:
  - `text/event-stream` with `itemSchema`
  - `application/json` plus `text/event-stream` side by side
  - schema unions for event variants
  - no accidental `schema`/`itemSchema` confusion
- Add regression tests proving 3.1 output stays unchanged when streaming path is
  unused.

### 5. Add One Real Example

- Prefer one example rooted in real LLM patterns:
  - streamed assistant response
  - event union with delta, tool, completed, error
- Keep it small.
- Goal:
  - prove doc output shape
  - prove normalization/validation story
  - give future work concrete fixture coverage

## Validation

- Minimum success criteria:
  - compiler can emit valid OpenAPI 3.2 sequential media type entries
  - streaming item schemas survive normalization
  - existing 3.1 fixtures stay stable unless intentionally migrated
  - one LLM-style example demonstrates real `text/event-stream` output
- If source changes land under `src/`, verify with:

```sh
bun check
```

## Recommendation

- Treat this as a targeted OpenAPI 3.2 feature, not a broad version-upgrade
  project.
- Prioritize only if upcoming work includes LLM or event-streaming APIs.
- If no concrete streamed API is planned, keep this doc as design context and
  defer implementation.

## Sources

- [OpenAPI Specification v3.1.0](https://spec.openapis.org/oas/v3.1.0.html)
- [OpenAPI Specification v3.2.0](https://spec.openapis.org/oas/v3.2.0.html)
- [OAS 3.2.0 release notes](https://github.com/OAI/OpenAPI-Specification/releases/tag/3.2.0)
- [WHATWG Server-Sent Events](https://html.spec.whatwg.org/dev/server-sent-events.html)
- [OpenAI streaming responses guide](https://developers.openai.com/api/docs/guides/streaming-responses)
- [OpenAI streaming events reference](https://platform.openai.com/docs/api-reference/responses-streaming/response)
- [Anthropic streaming messages](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [Kimi Chat API](https://platform.kimi.ai/docs/api/chat)
- [Kimi introduction](https://platform.kimi.ai/docs/introduction)
- [AGENTS.md](../../AGENTS.md)
