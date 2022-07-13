import { Named, Optionality, Schema, TheType } from "./schema"

type PrimitiveSchema = Schema<string | number | boolean>
type PrimitiveOptionality = Optionality<string | number | boolean>
type PrimitiveNamed = Named<string | number | boolean>

type Codes = Record<number, TheType<unknown>>

export interface Bodyless {
  name?: string
  reqHeaders?: Headers
  params?: Record<string, PrimitiveSchema | PrimitiveNamed>
  query?: Record<
    string,
    PrimitiveSchema | PrimitiveOptionality | PrimitiveNamed
  >
  res: Codes
}

export interface Bodied extends Bodyless {
  req:
    | TheType<unknown>
    | {
        headers?: Headers
        body: TheType<unknown>
      }
}

export type Headers = Record<
  Lowercase<string>,
  PrimitiveSchema | PrimitiveNamed | PrimitiveOptionality
>

export interface ScopeOpts {
  req?: {
    body: Mime
    headers?: Headers
  }
  res?: {
    body: Mime
    headers?: Headers
    codes?: Codes
  }
}

export interface Scope {
  endpoints: Endpoints
  opts: ScopeOpts
}

type Endpoints = Record<
  `/${string}`,
  | {
      GET?: Bodyless
      HEAD?: Bodyless
      DELETE?: Bodyless

      POST?: Bodied
      PUT?: Bodied
      PATCH?: Bodied
    }
  | Scope
>

export const scope = (endpoints: Endpoints, opts: ScopeOpts): Scope => ({
  endpoints,
  opts,
})

type Mime = `${string}/${string}`

export const service = (
  name: string,
  endpoints: Endpoints,
  opts?: ScopeOpts,
) => ({
  name,
  endpoints,
  opts,
})
