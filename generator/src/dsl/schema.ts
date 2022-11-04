import {
  Optional,
  OptionalBag,
  Range,
  RSchema,
  RString,
  SchemaOrRef,
  StringFormat,
} from "../core/endpoint"

export const optional = (schema: SchemaOrRef): Optional => ({
  schema,
  type: "optional",
})

export const nat32 = (opts?: NumberOpts): RSchema =>
  newType(int32({ minimum: 0, ...opts }))

export const nat64 = (opts?: NumberOpts): RSchema =>
  newType(int64({ minimum: 0, ...opts }))

export const utcMillis = (): RSchema => newType(int64())

export const seconds = (): RSchema => newType(int64({ minimum: 0 }))

interface StringOpts {
  length?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  format?: StringFormat
}

export const string = (opts?: StringOpts): RString => ({
  type: "string",
  ...opts,
})

export const uuid = (): RSchema => ({
  type: "string",
  format: "uuid",
})

export const newType = (underlying: RSchema): RSchema => ({
  type: "newtype",
  underlying,
})

export const external = (): RSchema => ({
  type: "external",
})

export const boolean = (): RSchema => ({
  type: "boolean",
})

export const unknown = (): RSchema => ({
  type: "unknown",
})

export const dict = (k: SchemaOrRef, v: SchemaOrRef): RSchema => ({
  type: "dict",
  k,
  v,
})

export const struct = (fields: OptionalBag): RSchema => ({
  type: "object",
  fields,
})

interface NumberOpts {
  minimum?: number
  maximum?: number
  range?: Range
  enum?: Array<number>
}

export const int32 = (opts?: NumberOpts): RSchema => ({
  type: "number",
  format: "int32",
  ...opts,
})

export const array = (items: SchemaOrRef): RSchema => ({
  type: "array",
  items,
})

export const dateTime = (): RSchema => ({
  type: "string",
  format: "date-time",
})

export const int64 = (opts?: NumberOpts): RSchema => ({
  type: "number",
  format: "int64",
  ...opts,
})

const stringOpts = (schema: RString, opts: StringOpts): RString => ({
  ...schema,
  ...opts,
})

/**
 * TODO generate pattern
 */
export const template = (
  strings: TemplateStringsArray,
  ...expr: RSchema[]
): RString => ({
  type: "string",
  template: { strings, expr },
})

export const union = (ss: ReadonlyArray<RSchema>): RSchema => {
  throw new Error("TODO")
}

export const stringEnum = (...variants: ReadonlyArray<string>): RString => ({
  type: "string",
  enum: variants,
})

/**
 * TODO just value
 */
export const constant = (s: string): RSchema => ({
  type: "string",
  enum: [s],
})

export const hostname = (): RSchema =>
  string({ minLength: 1, format: "hostname" })

export const mime = (): RSchema => template`${string()}/${string()}`

export const httpURL = (): RString =>
  stringOpts(template`http${stringEnum("s", "")}://${string()}`, {
    format: "uri",
  })

export const email = (): RSchema =>
  stringOpts(template`${string()}@${string()}.${string()}`, { format: "email" })
