export type RefsRec = Record<string, Schema<any, unknown>>

export interface Range {
  start: number
  end: number
  step: number
}

type StringFormat =
  | "email"
  | "date"
  | "date-time"
  | "password"
  | "uri"
  | "hostname"
  | "uuid"
  | "ipv4"
  | "ipv6"
  | "byte"
  | "binary"

export type Schema<Refs extends RefsRec, T> =
  | {
      type: "string"
      format?: StringFormat
      minLength?: number
      maxLength?: number
      pattern?: RegExp
      enum?: ReadonlyArray<string>

      /**
       * TODO how do we verify
       */
      template?: string
    }
  | {
      type: "number"
      format?: "int32" | "int64" | "float" | "double"
      minimum?: number
      maximum?: number
      range?: Range
      enum?: ReadonlyArray<number>
    }
  | { type: "boolean" }
  | { type: "unknown" }
  | { type: "array"; items: Schema<Refs, unknown> }
  | {
      type: "object"
      fields: Record<
        string,
        SchemaOrRef<Refs, unknown> | Optional<Refs, unknown>
      >
    }
  | { type: "union"; oneOf: Schema<Refs, unknown>[] }
  | { type: "newtype"; underlying: Schema<Refs, T> }
  | { type: "external" }

export interface Optional<Schemas extends RefsRec, T> {
  schema: Schema<Schemas, T>
}

export const optional = <Schemas extends RefsRec, T>(
  schema: Schema<Schemas, T>,
): Optional<Schemas, T> => ({ schema })

export const nat = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): Schema<Schemas, number> => newType(int32({ minimum: 0, ...opts }))

export const utcMillis = <Schemas extends RefsRec>(): Schema<Schemas, number> =>
  newType(int64())

export const seconds = <Schemas extends RefsRec>(): Schema<Schemas, number> =>
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
): Schema<Schemas, string> => ({ type: "string", ...opts })

const uuid = <Schemas extends RefsRec>(): Schema<Schemas, string> => ({
  type: "string",
  format: "uuid",
})

export const newType = <Schemas extends RefsRec, T>(
  underlying: Schema<Schemas, T>,
): Schema<Schemas, T> => ({
  type: "newtype",
  underlying,
})

export const external = <Schemas extends RefsRec, T>(): Schema<Schemas, T> => ({
  type: "external",
})

export const boolean = <Schemas extends RefsRec>(): Schema<
  Schemas,
  boolean
> => ({
  type: "boolean",
})

export type SchemaOrRef<Refs extends RefsRec, T> = Schema<Refs, T> | keyof Refs

export const unknown = <Schemas extends RefsRec>(): Schema<
  Schemas,
  unknown
> => ({
  type: "unknown",
})

export const struct = <Schemas extends RefsRec>(
  fields: Record<
    string,
    SchemaOrRef<Schemas, unknown> | Optional<Schemas, unknown>
  >,
): Schema<Schemas, object> => {
  throw new Error("TODO")
}

interface NumberOpts {
  minimum?: number
  maximum?: number
  range?: Range
  enum?: ReadonlyArray<number>
}

export const int32 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): Schema<Schemas, number> => ({
  type: "number",
  format: "int32",
  ...opts,
})

export const array = <Schemas extends RefsRec, X>(
  items: Schema<Schemas, X>,
): Schema<Schemas, ReadonlyArray<X>> => ({
  type: "array",
  items,
})

export const dateTime = <Schemas extends RefsRec>(): Schema<
  Schemas,
  string
> => ({
  type: "string",
  format: "date-time",
})

export const int64 = <Schemas extends RefsRec>(
  opts?: NumberOpts,
): Schema<Schemas, number> => ({
  type: "number",
  format: "int64",
  ...opts,
})

export const template = <Schemas extends RefsRec>(
  strings: TemplateStringsArray,
  ...expr: Schema<Schemas, unknown>[]
): Schema<Schemas, string> => {
  throw new Error("TODO")
}

export const union = <Schemas extends RefsRec>(
  ss: ReadonlyArray<Schema<Schemas, unknown>>,
): Schema<Schemas, unknown> => {
  throw new Error("TODO")
}

export const stringEnum = <Schemas extends RefsRec>(
  ...variants: ReadonlyArray<string>
): Schema<Schemas, string> => ({
  type: "string",
  enum: variants,
})

/**
 * TODO just value
 */
export const constant = <Schemas extends RefsRec>(
  s: string,
): Schema<Schemas, string> => ({
  type: "string",
  enum: [s],
})

export const email = <Schemas extends RefsRec>(): Schema<Schemas, string> => {
  throw new Error("TODO pass format: email")
}

export const hostname = <Schemas extends RefsRec>(): Schema<Schemas, string> =>
  string({ minLength: 1, format: "hostname" })

export const mime = <Schemas extends RefsRec>(): Schema<Schemas, string> => {
  throw new Error("TODO template")
}

export function httpURL<Refs extends RefsRec>(): Schema<Refs, string> {
  throw new Error("TODO pass format: uri")
  // return template`http${stringEnum("s", "")}://${string()}`
}
