import { deepEqual } from "../help/deep-equal.ts"
import { isOptional, type NameWithOptionality } from "./dsl.ts"
import type { Nameable } from "./nameable.ts"
import type { Mime } from "./scope.ts"

export type SchemaExtensionValue =
  | string
  | number
  | boolean
  | null
  | readonly SchemaExtensionValue[]
  | { readonly [key: string]: SchemaExtensionValue }

export interface SchemaExtensions {
  readonly [name: `x-${string}`]: SchemaExtensionValue
}

type SchemaOpts<T> = Readonly<{
  default?: unknown
  description?: string
  deprecated?: boolean

  examples?: readonly T[] | null

  /** @deprecated Use {@link examples} instead */
  example?: T | null
}> &
  SchemaExtensions

type KnownStringFormat =
  | "byte"
  | "email"
  | "uri"
  | "uuid"
  | "date"
  | "date-time"
  | "binary"
  | "url"
  | "blob"
  | "duration"

type StringFormat = KnownStringFormat | (string & {})

interface StringsOpts extends SchemaOpts<string> {
  format?: StringFormat
  contentMediaType?: Mime
  minLength?: number
  maxLength?: number
  pattern?: string | RegExp
  enum?: readonly string[]
  const?: string
}

interface Str extends Omit<StringsOpts, "pattern"> {
  type: "string"
  pattern?: string
}

interface NumberOpts extends SchemaOpts<number> {
  minimum?: number
  maximum?: number
}

interface Int extends NumberOpts {
  type: "integer"
  format?: "int32" | "int64" | "uint32" | "uint64"
}

interface Float extends NumberOpts {
  type: "number"
  format?: "float" | "double"
}

export interface Obj extends SchemaOpts<Record<string, unknown>> {
  type: "object"
  properties: Record<string, Schema>
  required?: readonly string[]
}

type Unknown = Record<string, never>

interface ArrayOpts extends SchemaOpts<ReadonlyArray<unknown>> {
  minItems?: number
  maxItems?: number
}

interface Arr extends ArrayOpts {
  type: "array"
  items: Schema
}

export const array = (items: Schema, opts?: ArrayOpts): Arr => ({
  type: "array",
  items,
  ...opts,
})

interface Bool extends SchemaOpts<boolean> {
  type: "boolean"
}

interface Null extends SchemaOpts<null> {
  type: "null"
}

interface DictOpts extends SchemaOpts<Record<PropertyKey, unknown>> {}

type Dict = Readonly<{
  type: "object"
  propertyNames?: DictKeySchema
  additionalProperties: Schema
}> &
  DictOpts

interface OneOf extends SchemaOpts<unknown> {
  oneOf: readonly Schema[]
}

interface AnyOf extends SchemaOpts<unknown> {
  anyOf: readonly Schema[]
}

interface AllOf extends SchemaOpts<unknown> {
  allOf: readonly Schema[]
}

type NonNullSchemaType =
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "object"
  | "array"

type Nullable =
  | ({
      type: readonly [NonNullSchemaType, "null"]
    } & (
      | Omit<Str, "type">
      | Omit<Num, "type">
      | Omit<Bool, "type">
      | Omit<Obj, "type">
      | Omit<Arr, "type">
      | Omit<Dict, "type">
    ))
  | Null
  | Unknown
  | AnyOf

type Num = Int | Float
type NonNullTypedSchema = Str | Num | Bool | Obj | Arr | Dict

export type RawSchema =
  | Str
  | Num
  | Bool
  | Null
  | Unknown
  | Obj
  | Arr
  | Dict
  | OneOf
  | AnyOf
  | AllOf
  | Nullable

export type Schema = Nameable<RawSchema>

type DictKeySchema = Nameable<Str | Num>

const DEFAULT_DICT_KEY_SCHEMA = { type: "string" } as const

export const dict = (k: DictKeySchema, v: Schema, opts?: DictOpts): Dict => {
  const ret: Dict = {
    ...opts,
    type: "object",
    additionalProperties: v,
  }
  if (!deepEqual(k, DEFAULT_DICT_KEY_SCHEMA)) {
    Object.assign(ret, { propertyNames: k })
  }
  return ret
}

interface ObjectOpts extends SchemaOpts<Record<string, unknown>> {}

export const object = (
  props: Readonly<Record<NameWithOptionality, Schema>> = {},
  opts?: ObjectOpts,
): Obj => {
  const properties = Object.fromEntries(
    Object.entries(props).map(([k, v]) => [
      isOptional(k) ? k.slice(0, -1) : k,
      v,
    ]),
  )
  const required = Object.keys(props).filter(k => !isOptional(k))
  const ret: Obj = {
    ...opts,
    type: "object",
    properties,
  }
  if (required.length > 0) {
    Object.assign(ret, { required })
  }
  return ret
}

export const int64 = (opts?: NumberOpts): Int => ({
  ...opts,
  type: "integer",
  format: "int64",
})

export const uint64 = (opts?: NumberOpts): Int => ({
  ...opts,
  type: "integer",
  format: "uint64",
})

export const integer = (opts?: NumberOpts): Int => ({
  ...opts,
  type: "integer",
})

export const int32 = (opts?: NumberOpts): Int => ({
  ...opts,
  type: "integer",
  format: "int32",
})

export const uint32 = (opts?: NumberOpts): Int => ({
  ...opts,
  type: "integer",
  format: "uint32",
})

export const number = (opts?: NumberOpts): Float => ({
  ...opts,
  type: "number",
})

export const float = (opts?: NumberOpts): Float => ({
  ...opts,
  type: "number",
  format: "float",
})

export const double = (opts?: NumberOpts): Float => ({
  ...opts,
  type: "number",
  format: "double",
})

const stringifyPattern = (
  pattern: string | RegExp | undefined,
): string | undefined => (pattern instanceof RegExp ? pattern.source : pattern)

export const string = (opts?: StringsOpts): Str => {
  const { pattern, ...rest } = opts ?? {}
  const stringPattern = stringifyPattern(pattern)

  if (stringPattern === undefined) {
    return {
      type: "string",
      ...rest,
    }
  }

  return {
    type: "string",
    ...rest,
    pattern: stringPattern,
  }
}

export const oneOf = (
  schemas: readonly Schema[],
  opts?: SchemaOpts<unknown>,
): OneOf => ({ ...opts, oneOf: schemas })

export const anyOf = (
  schemas: readonly Schema[],
  opts?: SchemaOpts<unknown>,
): AnyOf => ({ ...opts, anyOf: schemas })

export const allOf = (
  schemas: readonly Schema[],
  opts?: SchemaOpts<unknown>,
): AllOf => ({ ...opts, allOf: schemas })

const isNonNullTypedSchema = (
  schema: RawSchema,
): schema is NonNullTypedSchema =>
  "type" in schema && typeof schema.type === "string" && schema.type !== "null"

export const nullable = (schema: RawSchema): Nullable => {
  if (isNonNullTypedSchema(schema)) {
    return {
      ...schema,
      type: [schema.type, "null"] as const,
    }
  }

  if ("type" in schema) {
    return schema
  }

  if ("oneOf" in schema || "anyOf" in schema || "allOf" in schema) {
    return anyOf([schema, { type: "null" }])
  }

  if (Object.keys(schema).length === 0) {
    return schema
  }

  return anyOf([schema, { type: "null" }])
}

export const boolean = (opts?: SchemaOpts<boolean>): Bool => ({
  type: "boolean",
  ...opts,
})

export const unknown = (): Unknown => ({})

export const email = (): Str => string({ format: "email" })

/** ISO 8601 / RFC 3339 duration string. */
export const isoDuration = (opts?: Omit<StringsOpts, "format">): Str =>
  string({
    examples: ["P1W", "P1M", "P1Y"],
    ...opts,
    format: "duration",
  })

export const httpURL = (): Str =>
  string({
    format: "uri",
    pattern: "^https?://\\S+$",
  })

export const unixMillis = (): Int =>
  int64({ description: "UNIX epoch milliseconds" })
