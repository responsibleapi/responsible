import {
  mergeOpts,
  Mime,
  OptionalBag,
  RequiredBag,
  SchemaOrRef,
} from "../core/endpoint"
import { Mimes, RefsRec, ServiceInfo } from "../core/core"

export interface FullRes {
  schema?: SchemaOrRef
  headers?: OptionalBag
  cookies?: OptionalBag
}

export type Codes = Record<number, SchemaOrRef | Mimes | FullRes>

interface Bodiless {
  name?: string
  headers?: OptionalBag
  query?: OptionalBag
  cookies?: OptionalBag
  res?: Codes
}

interface Bodied extends Bodiless {
  req: SchemaOrRef
}

export type DslOp = Bodied | Bodiless

export interface PathWithMethods {
  params?: RequiredBag

  GET?: Bodiless
  HEAD?: Bodiless
  DELETE?: Bodiless

  POST?: Bodied
  PUT?: Bodied
  PATCH?: Bodied
}

export type Endpoints = Record<`/${string}`, PathWithMethods | Scope>

export const isScope = (x: PathWithMethods | Scope): x is Scope =>
  "endpoints" in x && typeof x.endpoints === "object"

export interface ScopeOpts {
  mirrorGETsAsHEADs?: boolean

  req?: {
    body?: Mime
    headers?: OptionalBag
    cookies?: OptionalBag
  }

  res?: {
    body?: Mime
    headers?: OptionalBag
    codes?: Codes
  }
}

export interface Scope {
  endpoints: Endpoints
  opts?: ScopeOpts
}

export const scope = (endpoints: Endpoints, opts?: ScopeOpts): Scope => ({
  endpoints,
  opts,
})

export interface DslService {
  info: ServiceInfo
  refs: RefsRec
  scope: Scope
}

export const service = (
  info: ServiceInfo,
  refs: RefsRec,
  endpoints: Endpoints,
  opts?: ScopeOpts,
): DslService => ({ info, refs, scope: scope(endpoints, opts) })

type TraversedPath = readonly [
  opts: ScopeOpts,
  path: `/${string}`,
  e: PathWithMethods,
]

export const flattenScopes = (init: Scope): ReadonlyArray<TraversedPath> => {
  const ret = Array<TraversedPath>()

  const stack: Array<[`/${string}`, Scope]> = [["" as `/${string}`, init]]

  while (stack.length) {
    const item = stack.pop()
    if (!item) break

    const [path, s] = item
    for (const k in s.endpoints) {
      const mergedPath = `${path}${k}` as const

      const e = s.endpoints[k as keyof Endpoints]
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
