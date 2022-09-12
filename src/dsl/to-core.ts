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
  isMime,
  isSchemaOrRef,
  RequiredBag,
  SchemaOrRef,
} from "../core/endpoint"
import { DslOp, DslService, flattenScopes, ScopeOpts } from "./endpoint"

export const isMimes = <Refs extends RefsRec>(x: unknown): x is Mimes<Refs> =>
  typeof x === "object" && !!x && Object.keys(x).every(isMime)

const toRes = <Refs extends RefsRec>(
  refs: Refs,
  opts: ScopeOpts<Refs>,
  what: SchemaOrRef<Refs> | Mimes<Refs>,
): CoreRes<Refs> => {
  const mime = opts.res?.body
  if (!mime) throw new Error(JSON.stringify(opts))

  const headers = opts.res?.headers

  if (isSchemaOrRef(refs, what)) {
    return { headers, body: { [mime]: what } }
  }

  if (isMimes(what)) {
    return { headers, body: what }
  }

  throw new Error(JSON.stringify(what))
}

const requestBody = <Refs extends RefsRec>(
  b: DslOp<Refs>,
): SchemaOrRef<Refs> => {
  if ("req" in b) {
    return b.req
  } else {
    throw new Error(JSON.stringify(b))
  }
}

const toOp = <Refs extends RefsRec>(
  refs: Refs,
  op: DslOp<Refs>,
  opts: ScopeOpts<Refs>,
  params?: RequiredBag<Refs>,
): CoreOp<Refs> => {
  const reqMime = opts.req?.body
  if (!reqMime) throw new Error(JSON.stringify(opts))

  return {
    name: op.name,
    req: {
      params,
      headers: { ...opts.req?.headers, ...op.headers },
      cookies: { ...opts.req?.cookies, ...op.cookies },
      query: op.query,
      body: { [reqMime]: requestBody(op) },
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
