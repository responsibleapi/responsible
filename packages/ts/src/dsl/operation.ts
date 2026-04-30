import type { NameWithOptionality } from "./dsl.ts"
import type { HttpMethod } from "./methods.ts"
import type { Nameable } from "./nameable.ts"
import type {
  HeaderParams,
  PathParams,
  QueryParams,
  ReusableParam,
} from "./params.ts"
import type { ReusableHeader } from "./response-headers.ts"
import type { Schema } from "./schema.ts"
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

type RequestBody = Schema | Record<Mime, Schema>

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

  readonly body?: Schema | Record<Mime, Schema>
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
