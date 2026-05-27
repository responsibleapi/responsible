import type { NameWithOptionality } from "./dsl.ts"
import type { HttpMethod } from "./methods.ts"
import { decodeNameable, named, ref, type Nameable } from "./nameable.ts"
import type {
  HeaderParams,
  PathParams,
  QueryParams,
  ReusableParam,
} from "./params.ts"
import type { ReusableHeader } from "./response-headers.ts"
import type { Obj, RawSchema, Schema } from "./schema.ts"
import { integer, object, oneOf, string } from "./schema.ts"
import type { Mime } from "./scope.ts"
import type { Security } from "./security.ts"
import type { DeclaredTags, OpTags } from "./tags.ts"

export interface GetOpReq {
  readonly security?: Security
  /* optional security means `value` OR `no authentication` */
  readonly "security?"?: Security

  readonly pathParams?: PathParams
  readonly query?: QueryParams
  readonly headers?: HeaderParams

  /**
   * The dedicated reuse mechanism for OpenAPI parameters. Keep one-off params
   * inline in {@link pathParams}, {@link query}, or {@link headers}. When a param
   * is shared across operations or scopes, declare it here instead of reusing
   * parameter maps via object spreading.
   *
   * @dsl
   */
  readonly params?: readonly ReusableParam[]
}

export interface ServerSentEventStream {
  /**
   * OpenAPI 3.2 schema for each Server-Sent Event in the stream.
   *
   * @dsl
   */
  readonly itemSchema: Schema
}

export type BodyContent = Schema | ServerSentEventStream

type RequestBody = BodyContent | Record<Mime, BodyContent>

interface OpReqWithBody {
  /**
   * **DSL**
   *
   * Required request body
   *
   * **Compiler**
   *
   * Emits `required: true`
   *
   * @dsl
   */
  readonly body?: RequestBody
  readonly "body?"?: never
}

interface OpReqWithOptionalBody {
  readonly body?: never

  /**
   * **DSL**
   *
   * Optional request body
   *
   * **Compiler**
   *
   * Does not emit anything
   *
   * @dsl
   */
  readonly "body?"?: RequestBody
}

type ExclusiveBody = OpReqWithBody | OpReqWithOptionalBody

export type OpReq = GetOpReq & ExclusiveBody

interface ReqMimeAugmentation {
  readonly mime?: Mime
}

export type ReqAugmentation = OpReq & ReqMimeAugmentation

/** Shared response-shape fields for {@link OpResp} and {@link RespAugmentation}. */
interface RespBase {
  /**
   * **DSL**
   *
   * One-off headers, nice DSL
   *
   * Emits:
   *
   * - `name` from prop name
   * - 'required` from prop name, depends on {@link NameWithOptionality}
   * - `schema` from {@link schema}
   *
   * @dsl
   */
  readonly headers?: HeaderParams

  /**
   * **DSL**
   *
   * Reused headers, not the best DSL but enables {@link Nameable}
   *
   * **Compiler**
   *
   * If {@link Nameable} thunk then:
   *
   * - Puts header in `#/components/headers/`
   * - Emits as `$ref`
   *
   * Otherwise emits as is
   *
   * @dsl
   */
  readonly headerParams?: readonly ReusableHeader[]

  /**
   * Response cookies (`Set-Cookie`). HTTP allows several `Set-Cookie` header
   * fields on one response; OpenAPI 3.0/3.1 cannot express that because
   * `response.headers` is a map keyed by header name. Modeling cookies here
   * avoids that limitation. Multiple same-name `Set-Cookie` definitions are
   * expected to become representable in **OpenAPI 3.2**; see the linked issue.
   *
   * @dsl
   *
   * @see https://github.com/OAI/OpenAPI-Specification/issues/1237
   */
  readonly cookies?: Record<NameWithOptionality, Schema>

  readonly body?: BodyContent | Record<Mime, BodyContent>
}

export interface RespAugmentation extends RespBase {
  readonly mime?: Mime
}

export type MatchStatus = number | `${number}..${number}`

export interface OpResp extends RespBase {
  /**
   * Even though `oas31.ResponseObject.description` is required, we don't
   * require it. The compiler will add the status number there
   *
   * @compiler
   */
  readonly description?: string
}

export type Resp = Nameable<OpResp>

export type OpResponses = Record<number, Resp | Schema>

/**
 * Shared fields for {@link GetOp} and {@link Op}.
 *
 * `TTags` is a {@link DeclaredTags} registry (from `declareTags`) so `tags` is a
 * tuple of those tag objects; the default keeps bare `Op` / `GetOp` and the
 * HTTP method helpers type-checkable without an explicit type argument.
 *
 * `x-stuff` extensions are supported here
 *
 * @dsl
 */
export interface OpBase<TTags extends DeclaredTags = DeclaredTags> {
  readonly id?: string
  readonly res?: OpResponses
  readonly deprecated?: boolean
  readonly description?: string
  readonly summary?: string
  readonly tags?: OpTags<TTags>
  readonly [ext: `x-${string}`]: unknown
}

export interface Op<
  TTags extends DeclaredTags = DeclaredTags,
> extends OpBase<TTags> {
  req?: OpReq | Schema
}

export interface GetOp<
  TTags extends DeclaredTags = DeclaredTags,
> extends OpBase<TTags> {
  req?: GetOpReq

  /**
   * Id for synthetic HEAD. Only valid for GET ops
   *
   * @dsl
   */
  headID?: string
}

export interface OpWithMethod<
  TTags extends DeclaredTags = DeclaredTags,
> extends Op<TTags> {
  method: HttpMethod
}

/**
 * Any operation node produced by HTTP method helpers at runtime (includes
 * {@link OpWithMethod} and GET’s {@link GetOp} + `method` shape).
 *
 * @compiler
 */
export type RouteMethodOp<TTags extends DeclaredTags = DeclaredTags> =
  | OpWithMethod<TTags>
  | (GetOp<TTags> & { method: "GET" })

/** This exists mostly to distinguish {@link Schema} from {@link Resp} */
export const resp = (param: OpResp): OpResp => param

export const sse = (
  itemSchema: Schema,
): Record<"text/event-stream", ServerSentEventStream> => ({
  "text/event-stream": { itemSchema },
})

const isObjectEventSchema = (schema: RawSchema): schema is Obj =>
  "type" in schema && schema.type === "object" && "properties" in schema

function readEventTypeConst(eventSchema: Schema): string {
  const { value } = decodeNameable(eventSchema)

  if (!isObjectEventSchema(value)) {
    throw new Error("sseJSON event schema must be an object schema")
  }

  const typeSchema = value.properties["type"]

  if (typeSchema === undefined) {
    throw new Error("sseJSON event schema must define a type property")
  }

  const decodedTypeSchema = decodeNameable(typeSchema).value

  if (!("type" in decodedTypeSchema) || decodedTypeSchema.type !== "string") {
    throw new Error(
      "sseJSON event schema type property must be a string schema",
    )
  }

  if (!("const" in decodedTypeSchema)) {
    throw new Error("sseJSON event schema type property must define const")
  }

  if (decodedTypeSchema.const === undefined) {
    throw new Error("sseJSON event schema type property must define const")
  }

  return decodedTypeSchema.const
}

const sseJSONEventSchema = (eventSchema: Schema): Obj =>
  object({
    event: string({ const: readEventTypeConst(eventSchema) }),
    data: string({
      contentMediaType: "application/json",
      contentSchema: eventSchema,
    }),
    "id?": string(),
    "retry?": integer({ minimum: 0 }),
  })

function collectEventSchemas(eventSchema: Schema): readonly Schema[] {
  const { value } = decodeNameable(eventSchema)

  return "oneOf" in value ? value.oneOf : [value]
}

function sseJSONItemSchema(eventSchema: Schema): RawSchema {
  const eventSchemas = collectEventSchemas(eventSchema)
  const eventTypes = new Set<string>()
  const itemSchemas: Obj[] = []

  for (const event of eventSchemas) {
    const eventType = readEventTypeConst(event)

    if (eventTypes.has(eventType)) {
      throw new Error(`sseJSON event type "${eventType}" is duplicated`)
    }

    eventTypes.add(eventType)
    itemSchemas.push(sseJSONEventSchema(event))
  }

  return itemSchemas.length === 1 ? itemSchemas[0]! : oneOf(itemSchemas)
}

/**
 * Models JSON-bearing Server-Sent Events from semantic event schemas.
 *
 * The input schema describes parsed JSON event data with a required `type:
 * string({ const: ... })` property. The emitted OpenAPI schema keeps the
 * wire-level SSE envelope and JSON string encoding explicit.
 *
 * @dsl
 */
export function sseJSON(
  eventSchema: Schema,
): Record<"text/event-stream", ServerSentEventStream> {
  const { name, summary, description } = decodeNameable(eventSchema)
  const itemSchema = sseJSONItemSchema(eventSchema)

  if (name === undefined || name === "") {
    return sse(itemSchema)
  }

  const namedItemSchema = named(name, itemSchema)

  return sse(
    summary === undefined && description === undefined
      ? namedItemSchema
      : ref(namedItemSchema, {
          ...(summary !== undefined ? { summary } : {}),
          ...(description !== undefined ? { description } : {}),
        }),
  )
}
