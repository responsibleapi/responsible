import {
  Optional,
  Range,
  RefsRec,
  RSchema,
  RString,
  SchemaOrRef,
  StringFormat,
} from "../core/endpoint"

export const optional = <Schemas extends RefsRec, T>(
  schema: SchemaOrRef<Schemas, T>,
): Optional<Schemas, T> => ({ schema, kind: "optional" })

export const nat32 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas, number> => newType(int32({ minimum: 0, ...opts }))

export const nat64 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas, number> => newType(int64({ minimum: 0, ...opts }))

export const utcMillis = <Schemas extends RefsRec>(): RSchema<
  Schemas,
  number
> => newType(int64())

export const seconds = <Schemas extends RefsRec>(): RSchema<Schemas, number> =>
  newType(int64({ minimum: 0 }))

interface StringOpts {
  length?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  format?: StringFormat
}

export const string = <Schemas extends RefsRec>(
  opts?: StringOpts,
): RString<Schemas> => ({ type: "string", ...opts })

const uuid = <Schemas extends RefsRec>(): RSchema<Schemas, string> => ({
  type: "string",
  format: "uuid",
})

export const newType = <Schemas extends RefsRec, T>(
  underlying: RSchema<Schemas, T>,
): RSchema<Schemas, T> => ({
  type: "newtype",
  underlying,
})

export const external = <Schemas extends RefsRec, T>(): RSchema<
  Schemas,
  T
> => ({
  type: "external",
})

export const boolean = <Schemas extends RefsRec>(): RSchema<
  Schemas,
  boolean
> => ({
  type: "boolean",
})

export const unknown = <Schemas extends RefsRec>(): RSchema<
  Schemas,
  unknown
> => ({
  type: "unknown",
})

export const dict = <Schemas extends RefsRec>(
  k: SchemaOrRef<Schemas, unknown>,
  v: SchemaOrRef<Schemas, unknown>,
): RSchema<Schemas, unknown> => ({
  type: "dict",
  k,
  v,
})

export const struct = <Schemas extends RefsRec>(
  fields: Record<
    string,
    SchemaOrRef<Schemas, unknown> | Optional<Schemas, unknown>
  >,
): RSchema<Schemas, object> => ({ type: "object", fields })

interface NumberOpts {
  minimum?: number
  maximum?: number
  range?: Range
  enum?: ReadonlyArray<number>
}

export const int32 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas, number> => ({
  type: "number",
  format: "int32",
  ...opts,
})

export const array = <Schemas extends RefsRec, X>(
  items: SchemaOrRef<Schemas, X>,
): RSchema<Schemas, ReadonlyArray<X>> => ({
  type: "array",
  items,
})

export const dateTime = <Schemas extends RefsRec>(): RSchema<
  Schemas,
  string
> => ({
  type: "string",
  format: "date-time",
})

export const int64 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas, number> => ({
  type: "number",
  format: "int64",
  ...opts,
})

const stringOpts = <T extends RefsRec>(
  schema: RString<T>,
  opts: StringOpts,
): RString<T> => ({ ...schema, ...opts })

export const template = <Schemas extends RefsRec>(
  strings: TemplateStringsArray,
  ...expr: RSchema<Schemas, unknown>[]
): RString<Schemas> => ({
  type: "string",
  template: { strings, expr },
})

export const union = <Schemas extends RefsRec>(
  ss: ReadonlyArray<RSchema<Schemas, unknown>>,
): RSchema<Schemas, unknown> => {
  throw new Error("TODO")
}

export const stringEnum = <Schemas extends RefsRec>(
  ...variants: ReadonlyArray<string>
): RSchema<Schemas, string> => ({
  type: "string",
  enum: variants,
})

/**
 * TODO just value
 */
export const constant = <Schemas extends RefsRec>(
  s: string,
): RSchema<Schemas, string> => ({
  type: "string",
  enum: [s],
})

export const hostname = <T extends RefsRec>(): RSchema<T, string> =>
  string({ minLength: 1, format: "hostname" })

export const mime = <T extends RefsRec>(): RSchema<T, string> =>
  template`${string()}/${string()}`

export const httpURL = <T extends RefsRec>(): RString<T> =>
  stringOpts(template`http${stringEnum("s", "")}://${string()}`, {
    format: "uri",
  })

export const email = <T extends RefsRec>(): RSchema<T, string> =>
  stringOpts(template`${string()}@${string()}.${string()}`, { format: "email" })
