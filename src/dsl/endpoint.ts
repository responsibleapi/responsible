import { Endpoints, RefsRec, Scope, ScopeOpts } from "../core/service"

export const scope = <Refs extends RefsRec>(
  endpoints: Endpoints<Refs>,
  opts?: ScopeOpts<Refs>,
): Scope<Refs> => ({
  endpoints,
  opts,
})

interface ServiceInfo {
  title: string
  version: `${string}.${string}`
}

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
