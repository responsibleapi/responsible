import { ScopeOpts } from "../dsl/endpoint"
import { RefsRec } from "./core"

export type Mime = `${string}/${string}`

export const mergeOpts = <Refs extends RefsRec>(
  ...arr: ReadonlyArray<ScopeOpts<Refs> | undefined>
): ScopeOpts<Refs> => {
  const noMime = undefined as Mime | undefined

  const ret = {
    req: { headers: {}, body: noMime },
    res: { headers: {}, body: noMime, codes: {} },
  }

  for (const opts of arr) {
    if (!opts) continue

    if (opts.req?.body && ret.req.body) {
      throw new Error("trying to register multiple request bodies")
    }
    ret.req.body = opts.req?.body ?? ret.req.body
    Object.assign(ret.req.headers, opts.req?.headers)

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

export interface Optional<Refs extends RefsRec> {
  kind: "optional"
  schema: SchemaOrRef<Refs>
}

export const isOptional = <Refs extends RefsRec>(
  x: Optional<Refs> | SchemaOrRef<Refs>,
): x is Optional<Refs> =>
  // @ts-ignore doesn't typecheck, so we test it instead
  Boolean(x) && typeof x === "object" && "kind" in x && x["kind"] === "optional"

export const optionalGet = <Refs extends RefsRec>(
  o: Optional<Refs> | SchemaOrRef<Refs>,
): SchemaOrRef<Refs> => (isOptional(o) ? o.schema : o)

export type SchemaOrRef<Refs extends RefsRec> = RSchema<Refs> | keyof Refs

export const isRef = <Refs extends RefsRec>(
  refs: Refs,
  x: unknown,
): x is keyof Refs => typeof x === "string" && x in refs

interface Template<Schemas extends RefsRec> {
  strings: ReadonlyArray<string>
  expr: SchemaOrRef<Schemas>[]
}

export interface RString<Refs extends RefsRec> {
  type: "string"
  format?: StringFormat
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  enum?: ReadonlyArray<string>
  template?: Template<Refs>
}

export type OptionalBag<Refs extends RefsRec> = Record<
  string,
  SchemaOrRef<Refs> | Optional<Refs>
>

export type RequiredBag<Refs extends RefsRec> = Record<
  string,
  SchemaOrRef<Refs>
>

export interface RObject<Refs extends RefsRec> {
  type: "object"
  fields: OptionalBag<Refs>
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

export interface RArr<Refs extends RefsRec> {
  type: "array"
  items: SchemaOrRef<Refs>
}

export type RSchema<Refs extends RefsRec> =
  | RString<Refs>
  | RNum
  | { type: "boolean" }
  | { type: "unknown" }
  | { type: "array"; items: SchemaOrRef<Refs> }
  | RObject<Refs>
  | { type: "union"; oneOf: RSchema<Refs>[] }
  | { type: "newtype"; underlying: RSchema<Refs> }
  | { type: "external" }
  | {
      type: "dict"
      k: SchemaOrRef<Refs>
      v: SchemaOrRef<Refs>
    }
