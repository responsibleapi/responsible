import { ScopeOpts } from "../dsl/endpoint"

export type RefsRec = Record<string, RSchema<any, unknown>>

type Primitive = string | number | boolean

type PrimitiveSchema<
  Refs extends RefsRec,
  P extends Primitive = Primitive,
> = SchemaOrRef<Refs, P>

type PrimitiveOptionality<
  Refs extends RefsRec,
  P extends Primitive = Primitive,
> = Optional<Refs, P>

export type PrimitiveBag<Refs extends RefsRec> = Record<
  string,
  PrimitiveSchema<Refs> | PrimitiveOptionality<Refs>
>

export type RequiredPrimitiveBag<Refs extends RefsRec> = Record<
  string,
  PrimitiveSchema<Refs>
>

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

export interface Optional<Refs extends RefsRec, JSType> {
  kind: "optional"
  schema: SchemaOrRef<Refs, JSType>
}

export const isOptional = <Refs extends RefsRec, JSType>(
  x: Optional<Refs, JSType> | SchemaOrRef<Refs, JSType>,
): x is Optional<Refs, JSType> =>
  // @ts-ignore doesn't typecheck, so we test it instead
  Boolean(x) && typeof x === "object" && "kind" in x && x["kind"] === "optional"

export const optionalGet = <Refs extends RefsRec, JSType>(
  o: Optional<Refs, JSType> | SchemaOrRef<Refs, JSType>,
): SchemaOrRef<Refs, JSType> => (isOptional(o) ? o.schema : o)

export type SchemaOrRef<Refs extends RefsRec, T> = RSchema<Refs, T> | keyof Refs

export const isRef = <Refs extends RefsRec>(
  refs: Refs,
  x: unknown,
): x is keyof Refs => typeof x === "string" && x in refs

interface Template<Schemas extends RefsRec> {
  strings: TemplateStringsArray
  expr: RSchema<Schemas, unknown>[]
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

export interface RObject<Refs extends RefsRec> {
  type: "object"
  fields: Record<string, SchemaOrRef<Refs, unknown> | Optional<Refs, unknown>>
}

export type RSchema<Refs extends RefsRec, T> =
  | RString<Refs>
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
  | { type: "array"; items: SchemaOrRef<Refs, unknown> }
  | RObject<Refs>
  | { type: "union"; oneOf: RSchema<Refs, unknown>[] }
  | { type: "newtype"; underlying: RSchema<Refs, T> }
  | { type: "external" }
  | {
      type: "dict"
      k: SchemaOrRef<Refs, unknown>
      v: SchemaOrRef<Refs, unknown>
    }
