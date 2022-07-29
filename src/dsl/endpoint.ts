import {
  mergeOpts,
  Mime,
  OptionalBag,
  RequiredBag,
  SchemaOrRef,
} from "../core/endpoint"
import { RefsRec, ServiceInfo } from "../core/core"

export type Codes<Refs extends RefsRec> = Record<
  number,
  SchemaOrRef<Refs> | Record<Mime, SchemaOrRef<Refs>>
>

interface BaseReq<Refs extends RefsRec> {
  name?: string
  headers?: OptionalBag<Refs>
  query?: OptionalBag<Refs>
  cookies?: OptionalBag<Refs>
  res: Codes<Refs>
}

interface Bodiless<Refs extends RefsRec> extends BaseReq<Refs> {}

interface Bodied<Refs extends RefsRec> extends BaseReq<Refs> {
  req: SchemaOrRef<Refs>
}

export type DslOp<Refs extends RefsRec> = Bodied<Refs> | Bodiless<Refs>

export interface PathWithMethods<Refs extends RefsRec> {
  params?: RequiredBag<Refs>

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

export interface ScopeOpts<Refs extends RefsRec> {
  req?: {
    body?: Mime
    headers?: OptionalBag<Refs>
    cookies?: OptionalBag<Refs>
  }

  res?: {
    body?: Mime
    headers?: OptionalBag<Refs>
    codes?: Codes<Refs>
  }
}

export interface Scope<Refs extends RefsRec> {
  endpoints: Endpoints<Refs>
  opts?: ScopeOpts<Refs>
}

export const scope = <Refs extends RefsRec>(
  endpoints: Endpoints<Refs>,
  opts?: ScopeOpts<Refs>,
): Scope<Refs> => ({
  endpoints,
  opts,
})

export interface DslService<Refs extends RefsRec> {
  info: ServiceInfo
  refs: Refs
  scope: Scope<Refs>
}

export const service = <Refs extends RefsRec>(
  info: ServiceInfo,
  refs: Refs,
  endpoints: Endpoints<Refs>,
  opts?: ScopeOpts<Refs>,
): DslService<Refs> => ({ info, refs, scope: scope(endpoints, opts) })

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
