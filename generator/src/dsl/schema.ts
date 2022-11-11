import {
  Optional,
  RSchema,
  RString,
  SchemaOrRef,
  StringFormat,
} from "../core/endpoint"

export const optional = (schema: SchemaOrRef): Optional => ({
  schema,
  type: "optional",
})

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

export const external = (): RSchema => ({
  type: "external",
})

export const unknown = (): RSchema => ({
  type: "unknown",
})

export const dict = (k: SchemaOrRef, v: SchemaOrRef): RSchema => ({
  type: "dict",
  k,
  v,
})

export const array = (items: SchemaOrRef): RSchema => ({
  type: "array",
  items,
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

export const stringEnum = (...variants: ReadonlyArray<string>): RString => ({
  type: "string",
  enum: variants,
})
export const mime = (): RSchema => template`${string()}/${string()}`

export const httpURL = (): RString =>
  stringOpts(template`http${stringEnum("s", "")}://${string()}`, {
    format: "uri",
  })
