export type SchemaRec<T extends Record<string, Schema<T, unknown>>> = Record<
  string,
  Schema<T, unknown>
>

export interface RObject<
  Schemas extends SchemaRec<Schemas>,
  K extends string = string,
  V = unknown,
> {
  type: "object"
  properties: Record<K, Schema<Schemas, V>>
  required?: K[]
}

export interface Range {
  start: number
  end: number
  step: number
}

export type Schema<Schemas extends SchemaRec<Schemas>, T> =
  | {
      type: "string"
      format?:
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
  | { type: "array"; items: Schema<Schemas, unknown> }
  | RObject<Schemas>
  | { type: "union"; oneOf: Schema<Schemas, unknown>[] }
  | { type: "newtype"; underlying: Schema<Schemas, T> }
  | { type: "external" }

export interface Optionality<Schemas extends SchemaRec<Schemas>, T> {
  type: Schema<Schemas, T>
  optional: boolean
}

export const string = <Schemas extends SchemaRec<Schemas>>(opts?: {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
}): Schema<Schemas, string> => ({ type: "string", ...opts })

const uuid = <Schemas extends SchemaRec<Schemas>>(): Schema<
  Schemas,
  string
> => ({
  type: "string",
  format: "uuid",
})

export const newType = <Schemas extends SchemaRec<Schemas>, T>(
  underlying: Schema<Schemas, T>,
): Schema<Schemas, T> => ({
  type: "newtype",
  underlying,
})

export const external = <Schemas extends SchemaRec<Schemas>, T>(): Schema<
  Schemas,
  T
> => ({
  type: "external",
})

export const boolean = <Schemas extends SchemaRec<Schemas>>(): Schema<
  Schemas,
  boolean
> => ({
  type: "boolean",
})

export type TheType<Schemas extends SchemaRec<Schemas>, T> =
  | Schema<Schemas, T>
  | keyof Schemas

export const unknown = <Schemas extends SchemaRec<Schemas>>(): Schema<
  Schemas,
  unknown
> => ({
  type: "unknown",
})

export const struct = <Schemas extends SchemaRec<Schemas>>(
  fields: Record<
    string,
    TheType<Schemas, unknown> | Optionality<Schemas, unknown>
  >,
): Schema<Schemas, object> => {
  throw new Error("TODO")
}

export const int32 = <Schemas extends SchemaRec<Schemas>>(opts?: {
  minimum?: number
  maximum?: number
  range?: Range
  enum?: ReadonlyArray<number>
}): Schema<Schemas, number> => ({
  type: "number",
  format: "int32",
  ...opts,
})

export const template = <Schemas extends SchemaRec<Schemas>>(
  strings: TemplateStringsArray,
  ...expr: Schema<Schemas, unknown>[]
): Schema<Schemas, string> => {
  throw new Error("TODO")
}

export const union = <Schemas extends SchemaRec<Schemas>>(
  ss: ReadonlyArray<Schema<Schemas, unknown>>,
): Schema<Schemas, unknown> => {
  throw new Error("TODO")
}

export const stringEnum = <Schemas extends SchemaRec<Schemas>>(
  ...variants: ReadonlyArray<string>
): Schema<Schemas, string> => ({
  type: "string",
  enum: variants,
})

/**
 * TODO just value
 */
export const constant = <Schemas extends SchemaRec<Schemas>>(
  s: string,
): Schema<Schemas, string> => ({
  type: "string",
  enum: [s],
})

export const email = <Schemas extends SchemaRec<Schemas>>(): Schema<
  Schemas,
  string
> => {
  throw new Error("TODO pass format: email")
}

export const hostname = <Schemas extends SchemaRec<Schemas>>(): Schema<
  Schemas,
  string
> => {
  throw new Error("TODO pass format: hostname")
  return string({ minLength: 1 })
}

export const httpURL = <Schemas extends SchemaRec<Schemas>>(): Schema<
  Schemas,
  string
> => {
  throw new Error("TODO pass format: uri")
  return template`http${stringEnum("s", "")}://${string()}`
}
