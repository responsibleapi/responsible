import { CoreTypeRefs } from "./core"

export type Mime = `${string}/${string}${`; charset=${string}` | ""}`

export const isMime = (x: unknown): x is Mime =>
  typeof x === "string" && x.length > 2 && x.includes("/")

export interface Range {
  start: number
  end: number
  step: number
}

export type StringFormat =
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

export interface Optional {
  type: "optional"
  schema: SchemaOrRef
}

export const isOptional = (x: Optional | SchemaOrRef): x is Optional =>
  typeof x === "object" && "type" in x && x["type"] === "optional"

export const optionalGet = (o: Optional | SchemaOrRef): SchemaOrRef =>
  isOptional(o) ? o.schema : o

export type SchemaOrRef = RSchema | string

export const isSchema = (x: unknown): x is RSchema =>
  typeof x === "object" &&
  !!x &&
  "type" in x &&
  typeof (x as RSchema)["type"] === "string"

export const isKey = <T>(o: T, k: unknown): k is keyof T =>
  o && typeof o === "object" && typeof k === "string" && k in o

export const isSchemaOrRef = (
  refs: CoreTypeRefs,
  x: unknown,
): x is SchemaOrRef => isKey(refs, x) || isSchema(x)

export interface RString {
  type: "string"
  format?: StringFormat
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  enum?: ReadonlyArray<string>
}

export type OptionalBag = Record<string, SchemaOrRef | Optional>

export type RequiredBag = Record<string, SchemaOrRef>

export interface RStruct {
  type: "object"
  fields: OptionalBag
}

export type NumFormat = "int32" | "int64" | "float" | "double"

export interface RNum {
  type: "number"
  format?: NumFormat
  minimum?: number
  maximum?: number
  range?: Range
  enum?: Array<number>
}

export interface RArr {
  type: "array"
  items: SchemaOrRef
  minItems?: number
}

export type RSchema =
  | RString
  | RNum
  | { type: "boolean" }
  | { type: "unknown" }
  | { type: "array"; items: SchemaOrRef }
  | RStruct
  | { type: "union"; oneOf: RSchema[] }
  | { type: "newtype"; schema: RSchema }
  | { type: "external" }
  | { type: "dict"; k: SchemaOrRef; v: SchemaOrRef }
  | {
      type: "runtime-library"
      name:
        | "httpURL"
        | "nat32"
        | "email"
        | "hostname"
        | "nat64"
        | "seconds"
        | "utcMillis"
        | "mime"
    }
