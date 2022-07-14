import { Optional, RefsRec, SchemaOrRef } from "./schema"

type Primitive = string | number | boolean

type PrimitiveSchema<Schemas extends RefsRec> = SchemaOrRef<Schemas, Primitive>

type PrimitiveOptionality<Refs extends RefsRec> = Optional<Refs, Primitive>

type Codes<Schemas extends RefsRec> = Record<
  number,
  SchemaOrRef<Schemas, unknown>
>

export interface Bodyless<Schemas extends RefsRec> {
  name?: string
  reqHeaders?: Headers<Schemas>
  params?: Record<string, PrimitiveSchema<Schemas>>
  query?: Record<
    string,
    PrimitiveSchema<Schemas> | PrimitiveOptionality<Schemas>
  >
  res: Codes<Schemas>
}

export interface Bodied<Schemas extends RefsRec> extends Bodyless<Schemas> {
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

export interface ScopeOpts<Schemas extends RefsRec> {
  req?: {
    body: Mime
    headers?: Headers<Schemas>
  }
  res?: {
    body: Mime
    headers?: Headers<Schemas>
    codes?: Codes<Schemas>
  }
}

export interface Scope<Schemas extends RefsRec> {
  endpoints: Endpoints<Schemas>
  opts: ScopeOpts<Schemas>
}

export type Endpoints<Schemas extends RefsRec> = Record<
  `/${string}`,
  | {
      GET?: Bodyless<Schemas>
      HEAD?: Bodyless<Schemas>
      DELETE?: Bodyless<Schemas>

      POST?: Bodied<Schemas>
      PUT?: Bodied<Schemas>
      PATCH?: Bodied<Schemas>
    }
  | Scope<Schemas>
>

export const scope = <Schemas extends RefsRec>(
  endpoints: Endpoints<Schemas>,
  opts: ScopeOpts<Schemas>,
): Scope<Schemas> => ({
  endpoints,
  opts,
})

type Mime = `${string}/${string}`

export const service = <Refs extends RefsRec, ES extends Endpoints<Refs>>(
  name: string,
  refs: Refs,
  endpoints: ES,
  opts?: ScopeOpts<Refs>,
) => ({
  name,
  refs,
  endpoints,
  opts,
})
