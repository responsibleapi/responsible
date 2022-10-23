import {
  CoreMethod,
  CoreOp,
  CoreRes,
  CoreResponses,
  CoreService,
  Mimes,
  RefsRec,
} from "../core/core"
import {
  DslOp,
  DslService,
  flattenScopes,
  FullRes,
  ScopeOpts,
} from "./endpoint"
import {
  isMime,
  isSchemaOrRef,
  RequiredBag,
  SchemaOrRef,
} from "../core/endpoint"

export const isMimes = <Refs extends RefsRec>(x: unknown): x is Mimes<Refs> =>
  typeof x === "object" && !!x && Object.keys(x).every(isMime)

const toRes = <Refs extends RefsRec>(
  refs: Refs,
  opts: ScopeOpts<Refs>,
  what: SchemaOrRef<Refs> | Mimes<Refs> | FullRes<Refs>,
): CoreRes<Refs> => {
  const mime = opts.res?.body
  const headers = opts.res?.headers

  if (isSchemaOrRef(refs, what)) {
    return {
      headers,
      body: mime ? { [mime]: what } : undefined,
    }
  }

  if (isMimes(what)) {
    return { headers, body: what }
  }

  throw new Error(JSON.stringify(what))
}

const requestBody = <Refs extends RefsRec>(
  b: DslOp<Refs>,
): SchemaOrRef<Refs> | undefined => {
  if ("req" in b) {
    return b.req
  }
}

const toOp = <Refs extends RefsRec>(
  refs: Refs,
  op: DslOp<Refs>,
  opts: ScopeOpts<Refs>,
  params?: RequiredBag<Refs>,
): CoreOp<Refs> => {
  const reqMime = opts.req?.body
  const rBody = requestBody(op)
  if (rBody && !reqMime) throw new Error(JSON.stringify(opts))

  return {
    name: op.name,
    req: {
      params,
      headers: { ...opts.req?.headers, ...op.headers },
      cookies: { ...opts.req?.cookies, ...op.cookies },
      query: op.query,
      body: reqMime && rBody ? { [reqMime]: rBody } : undefined,
    },
    res: Object.fromEntries(
      Object.entries({ ...opts.res?.codes, ...op.res }).map(([k, v]) => [
        k,
        toRes(refs, opts, v),
      ]),
    ) as CoreResponses<Refs>,
  }
}

/**
 * TODO extract components/responses
 */
export const toCore = <Refs extends RefsRec>(
  s: DslService<Refs>,
): CoreService<Refs> => ({
  info: s.info,
  refs: s.refs,
  paths: Object.fromEntries(
    flattenScopes(s.scope).map(([opts, path, { params, ...methods }]) => [
      path,
      Object.fromEntries(
        Object.entries(methods as Record<CoreMethod, DslOp<Refs>>).map(
          ([k, v]) => [k, toOp(s.refs, v, opts, params)],
        ),
      ) as Record<CoreMethod, CoreOp<Refs>>,
    ]),
  ),
})
