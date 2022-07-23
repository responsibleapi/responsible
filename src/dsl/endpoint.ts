import {
  mergeOpts,
  Mime,
  PrimitiveBag,
  RefsRec,
  RequiredPrimitiveBag,
  SchemaOrRef,
} from "../core/endpoint"
import { ServiceInfo } from "../core/core"

export type Codes<Refs extends RefsRec> = Record<
  number,
  SchemaOrRef<Refs, unknown>
>

interface BaseReq<Refs extends RefsRec> {
  name?: string
  query?: PrimitiveBag<Refs>
  res: Codes<Refs>
}

interface Bodiless<Schemas extends RefsRec> extends BaseReq<Schemas> {
  reqHeaders?: PrimitiveBag<Schemas>
}

interface Bodied<Schemas extends RefsRec> extends BaseReq<Schemas> {
  req:
    | SchemaOrRef<Schemas, unknown>
    | {
        headers?: PrimitiveBag<Schemas>
        body: SchemaOrRef<Schemas, unknown>
      }
}

export type RRequest<Refs extends RefsRec> = Bodied<Refs> | Bodiless<Refs>

export interface PathWithMethods<Refs extends RefsRec> {
  params?: RequiredPrimitiveBag<Refs>

  GET?: Bodiless<Refs>
  HEAD?: Bodiless<Refs>
  DELETE?: Bodiless<Refs>

  POST?: Bodied<Refs>
  PUT?: Bodied<Refs>
  PATCH?: Bodied<Refs>
}

export type Endpoints<Refs extends RefsRec> = Record<
  `/${string}`,
  PathWithMethods<Refs> | Scope<Refs>
>

export const isScope = <Refs extends RefsRec>(
  x: PathWithMethods<Refs> | Scope<Refs>,
): x is Scope<Refs> => "endpoints" in x && typeof x.endpoints === "object"

export interface ScopeOpts<Schemas extends RefsRec> {
  req?: {
    body?: Mime
    headers?: PrimitiveBag<Schemas>
  }

  res?: {
    body?: Mime
    headers?: PrimitiveBag<Schemas>
    codes?: Codes<Schemas>
  }
}

export interface Scope<Schemas extends RefsRec> {
  endpoints: Endpoints<Schemas>
  opts?: ScopeOpts<Schemas>
}

export const scope = <Refs extends RefsRec>(
  endpoints: Endpoints<Refs>,
  opts?: ScopeOpts<Refs>,
): Scope<Refs> => ({
  endpoints,
  opts,
})

export interface Service<Refs extends RefsRec> {
  info: ServiceInfo
  refs: Refs
  scope: Scope<Refs>
}

export const service = <Refs extends RefsRec>(
  info: ServiceInfo,
  refs: Refs,
  endpoints: Endpoints<Refs>,
  opts?: ScopeOpts<Refs>,
): Service<Refs> => ({ info, refs, scope: scope(endpoints, opts) })

type TraversedPath<Refs extends RefsRec> = readonly [
  opts: ScopeOpts<Refs>,
  path: `/${string}`,
  e: PathWithMethods<Refs>,
]

export const flattenScopes = <Refs extends RefsRec>(
  init: Scope<Refs>,
): ReadonlyArray<TraversedPath<Refs>> => {
  const ret = Array<TraversedPath<Refs>>()

  const stack: Array<[`/${string}`, Scope<Refs>]> = [["" as `/${string}`, init]]

  while (stack.length) {
    const item = stack.pop()
    if (!item) break

    const [path, s] = item
    for (const k in s.endpoints) {
      const mergedPath = `${path}${k}` as const

      const e = s.endpoints[k as keyof Endpoints<Refs>]
      if (isScope(e)) {
        stack.push([
          mergedPath,
          { endpoints: e.endpoints, opts: mergeOpts(s.opts, e.opts) },
        ])
      } else {
        ret.push([s.opts ?? {}, mergedPath, e])
      }
    }
  }

  return ret
}
