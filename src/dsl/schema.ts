export interface RObject<K extends string = string, V = unknown> {
  type: "object"
  properties: Record<K, Schema<V>>
  required?: K[]
}

export interface Range {
  start: number
  end: number
  step: number
}

export type Schema<T> =
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
  | { type: "array"; items: Schema<unknown> }
  | RObject
  | { type: "union"; oneOf: Schema<unknown>[] }

export interface Named<T> {
  kind: "alias" | "newtype"
  name: string
  underlying: Schema<T>
}

interface External<T> {
  kind: "external"
  name: string
}

export interface Optionality<T> {
  type: Schema<T> | Named<T> | External<T>
  optional: boolean
}

export const string = (opts?: {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
}): Schema<string> => ({ type: "string", ...opts })

const uuid = (): Schema<string> => ({ type: "string", format: "uuid" })

export const newType = <T>(
  name: string,
  underlying: Schema<T> | Named<T>,
): Named<T> => ({
  kind: "newtype",
  name,
  underlying: "type" in underlying ? underlying : underlying.underlying,
})

export const external = <T>(name: string): External<T> => ({
  kind: "external",
  name,
})

export const boolean = (): Schema<boolean> => ({ type: "boolean" })

export type TheType<T> = Schema<T> | Named<T> | External<T>

export const unknown = (): Schema<unknown> => ({ type: "unknown" })

export const struct = (
  name: string,
  fields: Record<string, TheType<unknown> | Optionality<unknown>>,
): Named<object> => {
  throw new Error("TODO")
}

export const int32 = (opts?: {
  minimum?: number
  maximum?: number
  range?: Range
  enum?: ReadonlyArray<number>
}): Schema<number> => ({
  type: "number",
  format: "int32",
  ...opts,
})

export const template = (
  strings: TemplateStringsArray,
  ...expr: Schema<unknown>[]
): Schema<string> => {
  throw new Error("TODO")
}

export const union = (ss: ReadonlyArray<Schema<unknown>>): Schema<unknown> => {
  throw new Error("TODO")
}

export const stringEnum = (
  ...variants: ReadonlyArray<string>
): Schema<string> => ({
  type: "string",
  enum: variants,
})

/**
 * TODO just value
 */
export const constant = (s: string): Schema<string> => ({
  type: "string",
  enum: [s],
})

export const email = (): Schema<string> => {
  throw new Error("TODO pass format: email")
}

export const hostname = (): Schema<string> => {
  throw new Error("TODO pass format: hostname")
  return string({ minLength: 1 })
}

export const httpURL = (): Schema<string> => {
  throw new Error("TODO pass format: uri")
  return template`http${stringEnum("s", "")}://${string()}`
}
