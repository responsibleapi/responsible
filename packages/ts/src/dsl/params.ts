import type { NameWithOptionality, OptionalKey } from "./dsl.ts"
import type { Nameable } from "./nameable.ts"
import type { Schema } from "./schema.ts"

interface ReusedParamBase {
  name: string
  description?: string
  schema: Schema
  example?: string
}

export interface QueryParamRaw extends ReusedParamBase {
  in: "query"
  required?: boolean
  style?: "form"
  explode?: boolean
}

export interface PathParamRaw extends ReusedParamBase {
  in: "path"
  required: true
  style?: "simple" | "label" | "matrix"
  explode?: boolean
}

export interface HeaderParamRaw extends ReusedParamBase {
  in: "header"
  required?: boolean
  style?: "simple"
  explode?: boolean
}

export type ParamRaw = QueryParamRaw | PathParamRaw | HeaderParamRaw

/** @dsl */
export type ReusableParam = Nameable<ParamRaw>

export const queryParam = (r: Omit<QueryParamRaw, "in">): QueryParamRaw => ({
  ...r,
  in: "query",
})

export const pathParam = (
  r: Omit<PathParamRaw, "in" | "required">,
): PathParamRaw => ({
  ...r,
  in: "path",
  required: true,
})

export const headerParam = (r: Omit<HeaderParamRaw, "in">): HeaderParamRaw => ({
  ...r,
  in: "header",
})

/**
 * **DSL**
 *
 * Record-style params with extra stuff, not just plain {@link Schema}
 *
 * **Compiler**
 *
 * Emits:
 *
 * - `name` from prop name
 * - 'required` from prop name, depends on {@link NameWithOptionality}
 * - `schema` from {@link schema}
 *
 * @dsl
 *
 * @see {@link GetOpReq}
 */
interface InlineParamBase {
  readonly schema: Schema
  readonly description?: string
  readonly example?: unknown
}

/** @see {@link PathParams} */
export interface InlinePathParam extends InlineParamBase {
  readonly style?: "simple" | "label" | "matrix"
  readonly explode?: boolean
}

/** @see {@link QueryParams} */
export interface InlineQueryParam extends InlineParamBase {
  readonly style?: "form"
  readonly explode?: boolean
}

/** @see {@link HeaderParams} */
export interface InlineHeaderParam extends InlineParamBase {
  style?: "simple"
  explode?: boolean
}

/**
 * **DSL**
 *
 * Path params are always required to build the path, so names with the "?"
 * suffix are rejected by forcing those keys to `never`
 *
 * **Compiler**
 *
 * Emits:
 *
 * - `name` from property name
 * - `required: true` always
 * - `schema` from {@link Schema} or {@link InlinePathParam.schema}
 *
 * @dsl
 *
 * @see {@link PathParamRaw.required}
 */
export interface PathParams extends Record<string, Schema | InlinePathParam> {
  readonly [name: OptionalKey]: never
}

/** @see {@link InlineParamBase} */
export type QueryParams = Record<NameWithOptionality, Schema | InlineQueryParam>

export type HeaderParams = Record<
  NameWithOptionality,
  Schema | InlineHeaderParam
>
