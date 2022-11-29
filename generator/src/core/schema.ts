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
  kind: "optional"
  schema: SchemaOrRef
}

export const isOptional = (x: Optional | SchemaOrRef): x is Optional =>
  typeof x === "object" && "kind" in x && x["kind"] === "optional"

export const optionalGet = (o: Optional | SchemaOrRef): SchemaOrRef =>
  isOptional(o) ? o.schema : o

export type SchemaOrRef = RSchema | string

export const isSchema = (x: unknown): x is RSchema =>
  !!x && typeof x === "object" && "type" in x && typeof x["type"] === "string"

export const isKey = <T>(o: T, k: unknown): k is keyof T =>
  o && typeof o === "object" && typeof k === "string" && k in o

export const schemaGet = (refs: CoreTypeRefs, x: SchemaOrRef): RSchema =>
  isSchema(x) ? x : refs[x]

export const isSchemaOrRef = (
  refs: CoreTypeRefs,
  x: unknown,
): x is SchemaOrRef => isKey(refs, x) || isSchema(x)

export interface RString {
  type: "string"
  format?: StringFormat
  minLength?: number
  maxLength?: number
  pattern?: string
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

export type RuntimeType =
  | "httpURL"
  | "nat32"
  | "nat64"
  | "email"
  | "hostname"
  | "seconds"
  | "utcMillis"
  | "mime"

export type RSchema =
  | RString
  | RNum
  | { type: "boolean" }
  | { type: "unknown" }
  | { type: "array"; items: SchemaOrRef }
  | RStruct
  | { type: "union"; oneOf: RSchema[] }
  | { type: "dict"; k: SchemaOrRef; v: SchemaOrRef }
  | { type: "external" }
  | { type: "runtime-library"; name: RuntimeType }
