import { ScopeOpts } from "../dsl/endpoint"
import { RefsRec } from "./core"

export type Mime = `${string}/${string}${`; charset=${string}` | ""}`

export const isMime = (x: unknown): x is Mime =>
  typeof x === "string" && x.length > 2 && x.includes("/")

export const mergeOpts = (
  ...arr: ReadonlyArray<ScopeOpts | undefined>
): ScopeOpts => {
  const noMime = undefined as Mime | undefined

  const ret = {
    req: { headers: {}, body: noMime, cookies: {} },
    res: { headers: {}, body: noMime, codes: {} },
  }

  for (const opts of arr) {
    if (!opts) continue

    if (opts.req?.body && ret.req.body) {
      throw new Error("trying to register multiple request bodies")
    }
    ret.req.body = opts.req?.body ?? ret.req.body
    Object.assign(ret.req.headers, opts.req?.headers)
    Object.assign(ret.req.cookies, opts.req?.cookies)

    if (opts.res?.body && ret.res.body) {
      throw new Error("trying to register multiple response bodies")
    }
    ret.res.body = opts.res?.body ?? ret.res.body
    Object.assign(ret.res.headers, opts.res?.headers)
    Object.assign(ret.res.codes, opts.res?.codes)
  }

  return ret
}

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
  typeof k === "string" && k in o

export const isSchemaOrRef = (refs: RefsRec, x: unknown): x is SchemaOrRef =>
  isKey(refs, x) || isSchema(x)

interface Template {
  strings: ReadonlyArray<string>
  expr: SchemaOrRef[]
}

export interface RString {
  type: "string"
  format?: StringFormat
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  enum?: ReadonlyArray<string>
  template?: Template
}

export type OptionalBag = Record<string, SchemaOrRef | Optional>

export type RequiredBag = Record<string, SchemaOrRef>

export interface RObject {
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
  | RObject
  | { type: "union"; oneOf: RSchema[] }
  | { type: "newtype"; underlying: RSchema }
  | { type: "external" }
  | {
      type: "dict"
      k: SchemaOrRef
      v: SchemaOrRef
    }
