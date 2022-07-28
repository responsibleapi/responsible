import {
  CoreMethod,
  CoreOp,
  CoreRes,
  CoreResponses,
  CoreService,
  RefsRec,
} from "../core/core"
import { DslOp, DslService, flattenScopes, ScopeOpts } from "./endpoint"
import { RequiredBag, SchemaOrRef } from "../core/endpoint"

const toRes = <Refs extends RefsRec>(
  opts: ScopeOpts<Refs>,
  schema: SchemaOrRef<Refs>,
): CoreRes<Refs> => {
  const mime = opts.res?.body
  if (!mime) throw new Error(JSON.stringify(opts))

  return {
    headers: opts.res?.headers,
    body: { [mime]: schema },
  }
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
        toRes(opts, v),
      ]),
    ) as CoreResponses<Refs>,
  }
}

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
          ([k, v]) => [k, toOp(v, opts, params)],
        ),
      ) as Record<CoreMethod, CoreOp<Refs>>,
    ]),
  ),
})
