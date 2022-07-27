import {
  Optional,
  OptionalBag,
  Range,
  RSchema,
  RString,
  SchemaOrRef,
  StringFormat,
} from "../core/endpoint"
import { RefsRec } from "../core/core"

export const optional = <Schemas extends RefsRec>(
  schema: SchemaOrRef<Schemas>,
): Optional<Schemas> => ({ schema, kind: "optional" })

export const nat32 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas> => newType(int32({ minimum: 0, ...opts }))

export const nat64 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas> => newType(int64({ minimum: 0, ...opts }))

export const utcMillis = <Refs extends RefsRec>(): RSchema<Refs> =>
  newType(int64())

export const seconds = <Schemas extends RefsRec>(): RSchema<Schemas> =>
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

const uuid = <Schemas extends RefsRec>(): RSchema<Schemas> => ({
  type: "string",
  format: "uuid",
})

export const newType = <Schemas extends RefsRec>(
  underlying: RSchema<Schemas>,
): RSchema<Schemas> => ({
  type: "newtype",
  underlying,
})

export const external = <Refs extends RefsRec>(): RSchema<Refs> => ({
  type: "external",
})

export const boolean = <Refs extends RefsRec>(): RSchema<Refs> => ({
  type: "boolean",
})

export const unknown = <Refs extends RefsRec>(): RSchema<Refs> => ({
  type: "unknown",
})

export const dict = <Schemas extends RefsRec>(
  k: SchemaOrRef<Schemas>,
  v: SchemaOrRef<Schemas>,
): RSchema<Schemas> => ({
  type: "dict",
  k,
  v,
})

export const struct = <Refs extends RefsRec>(
  fields: OptionalBag<Refs>,
): RSchema<Refs> => ({
  type: "object",
  fields,
})

interface NumberOpts {
  minimum?: number
  maximum?: number
  range?: Range
  enum?: Array<number>
}

export const int32 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas> => ({
  type: "number",
  format: "int32",
  ...opts,
})

export const array = <Refs extends RefsRec>(
  items: SchemaOrRef<Refs>,
): RSchema<Refs> => ({
  type: "array",
  items,
})

export const dateTime = <Refs extends RefsRec>(): RSchema<Refs> => ({
  type: "string",
  format: "date-time",
})

export const int64 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): RSchema<Schemas> => ({
  type: "number",
  format: "int64",
  ...opts,
})

const stringOpts = <T extends RefsRec>(
  schema: RString<T>,
  opts: StringOpts,
): RString<T> => ({ ...schema, ...opts })

/**
 * TODO generate pattern
 */
export const template = <Schemas extends RefsRec>(
  strings: TemplateStringsArray,
  ...expr: RSchema<Schemas>[]
): RString<Schemas> => ({
  type: "string",
  template: { strings, expr },
})

export const union = <Schemas extends RefsRec>(
  ss: ReadonlyArray<RSchema<Schemas>>,
): RSchema<Schemas> => {
  throw new Error("TODO")
}

export const stringEnum = <Schemas extends RefsRec>(
  ...variants: ReadonlyArray<string>
): RString<Schemas> => ({
  type: "string",
  enum: variants,
})

/**
 * TODO just value
 */
export const constant = <Schemas extends RefsRec>(
  s: string,
): RSchema<Schemas> => ({
  type: "string",
  enum: [s],
})

export const hostname = <Refs extends RefsRec>(): RSchema<Refs> =>
  string({ minLength: 1, format: "hostname" })

export const mime = <Refs extends RefsRec>(): RSchema<Refs> =>
  template`${string()}/${string()}`

export const httpURL = <T extends RefsRec>(): RString<T> =>
  stringOpts(template`http${stringEnum("s", "")}://${string()}`, {
    format: "uri",
  })

export const email = <T extends RefsRec>(): RSchema<T> =>
  stringOpts(template`${string()}@${string()}.${string()}`, { format: "email" })
