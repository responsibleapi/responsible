export type RefsRec = Record<string, RSchema<any, unknown>>

type Codes<Refs extends RefsRec> = Record<number, SchemaOrRef<Refs, unknown>>

export interface Bodiless<Schemas extends RefsRec> {
  name?: string
  reqHeaders?: Headers<Schemas>
  query?: Record<
    string,
    PrimitiveSchema<Schemas> | PrimitiveOptionality<Schemas>
  >
  res: Codes<Schemas>
}

export interface Bodied<Schemas extends RefsRec> extends Bodiless<Schemas> {
  req:
    | SchemaOrRef<Schemas, unknown>
    | {
        headers?: Headers<Schemas>
        body: SchemaOrRef<Schemas, unknown>
      }
}

export type Headers<Schemas extends RefsRec> = Record<
  Lowercase<string>,
  PrimitiveSchema<Schemas> | PrimitiveOptionality<Schemas>
>

type Primitive = string | number | boolean

type PrimitiveSchema<
  Schemas extends RefsRec,
  P extends Primitive = Primitive,
> = SchemaOrRef<Schemas, P>

type PrimitiveOptionality<
  Refs extends RefsRec,
  P extends Primitive = Primitive,
> = Optional<Refs, P>

export type Endpoints<Schemas extends RefsRec> = Record<
  `/${string}`,
  | {
      params?: Record<string, PrimitiveSchema<Schemas>>

      GET?: Bodiless<Schemas>
      HEAD?: Bodiless<Schemas>
      DELETE?: Bodiless<Schemas>

      POST?: Bodied<Schemas>
      PUT?: Bodied<Schemas>
      PATCH?: Bodied<Schemas>
    }
  | Scope<Schemas>
>

type Mime = `${string}/${string}`

export interface ScopeOpts<Schemas extends RefsRec> {
  req?: {
    body?: Mime
    headers?: Headers<Schemas>
  }
  res?: {
    body?: Mime
    headers?: Headers<Schemas>
    codes?: Codes<Schemas>
  }
}

export interface Scope<Schemas extends RefsRec> {
  endpoints: Endpoints<Schemas>
  opts?: ScopeOpts<Schemas>
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
  x: unknown,
): x is Optional<Refs, JSType> =>
  // @ts-ignore doesn't typecheck, so we test it instead
  Boolean(x) && typeof x === "object" && "kind" in x && x["kind"] === "optional"

export type SchemaOrRef<Refs extends RefsRec, T> = RSchema<Refs, T> | keyof Refs

export const isRef = <Refs extends RefsRec>(
  refs: Refs,
  x: unknown,
): x is keyof Refs => typeof x === "string" && x in refs

export interface RObject<Refs extends RefsRec> {
  type: "object"
  fields: Record<string, SchemaOrRef<Refs, unknown> | Optional<Refs, unknown>>
}

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
