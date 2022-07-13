import { Optionality, SchemaRec, TheType } from "./schema"

type PrimitiveSchema<Schemas extends SchemaRec<Schemas>> = TheType<
  Schemas,
  string | number | boolean
>

type PrimitiveOptionality<Schemas extends SchemaRec<Schemas>> = Optionality<
  Schemas,
  string | number | boolean
>

type Codes<Schemas extends SchemaRec<Schemas>> = Record<
  number,
  TheType<Schemas, unknown>
>

export interface Bodyless<Schemas extends SchemaRec<Schemas>> {
  name?: string
  reqHeaders?: Headers<Schemas>
  params?: Record<string, PrimitiveSchema<Schemas>>
  query?: Record<
    string,
    PrimitiveSchema<Schemas> | PrimitiveOptionality<Schemas>
  >
  res: Codes<Schemas>
}

export interface Bodied<Schemas extends SchemaRec<Schemas>>
  extends Bodyless<Schemas> {
  req:
    | TheType<Schemas, unknown>
    | {
        headers?: Headers<Schemas>
        body: TheType<Schemas, unknown>
      }
}

export type Headers<Schemas extends SchemaRec<Schemas>> = Record<
  Lowercase<string>,
  PrimitiveSchema<Schemas> | PrimitiveOptionality<Schemas>
>

export interface ScopeOpts<Schemas extends SchemaRec<Schemas>> {
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

export interface Scope<Schemas extends SchemaRec<Schemas>> {
  endpoints: Endpoints<Schemas>
  opts: ScopeOpts<Schemas>
}

export type Endpoints<Schemas extends SchemaRec<Schemas>> = Record<
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

export const scope = <Schemas extends SchemaRec<Schemas>>(
  endpoints: Endpoints<Schemas>,
  opts: ScopeOpts<Schemas>,
): Scope<Schemas> => ({
  endpoints,
  opts,
})

type Mime = `${string}/${string}`

export const service = <
  Schemas extends SchemaRec<Schemas>,
  Es extends Endpoints<Schemas>,
>(
  name: string,
  schema: Schemas,
  endpoints: Es,
  opts?: ScopeOpts<Schemas>,
) => ({
  name,
  endpoints,
  opts,
})
