import type { AtLeastOne, AtLeastTwo } from "../help/lib.ts"
import type { HttpMethod, MethodRoutes } from "./methods.ts"
import type {
  MatchStatus,
  OpBase,
  OpResponses,
  ReqAugmentation,
  RespAugmentation,
} from "./operation.ts"
import type { PathParams, ReusableParam } from "./params.ts"
import type { DeclaredTags, OpTags } from "./tags.ts"

export type Mime = `${string}/${string}`

type ScopeResAugmentation = NonNullable<
  AtLeastOne<{
    mime?: Mime
    defaults?: Record<MatchStatus, RespAugmentation>
    add?: OpResponses
  }>
>

type ScopeResShape = ScopeResAugmentation | OpResponses

/**
 * This validates a concrete scope-level response object. The default keeps the
 * public DSL surface broad, while specific inputs can collapse to `never` when
 * they are neither a response augmentation object nor a numeric status map.
 */
export type ScopeRes<T extends object = ScopeResShape> =
  T extends ScopeResAugmentation
    ? T
    : keyof T extends never
      ? never
      : Exclude<keyof T, number> extends never
        ? T
        : never

export type HttpPath = `/${string}`

export type ScopeOrOp<TTags extends DeclaredTags = DeclaredTags> =
  | OpBase<TTags>
  | Scope<TTags>

/** For root level; only {@link HttpPath} keys */
export type PathRoutes<TTags extends DeclaredTags = DeclaredTags> = Record<
  HttpPath,
  ScopeOrOp<TTags>
>

export type ScopeRoutes<TTags extends DeclaredTags = DeclaredTags> =
  MethodRoutes<TTags> & Partial<PathRoutes<TTags>>

const isHttpMethodKey = (key: string): key is HttpMethod =>
  key === "GET" ||
  key === "POST" ||
  key === "PUT" ||
  key === "DELETE" ||
  key === "HEAD"

const isHttpPathKey = (key: string): key is HttpPath => key.startsWith("/")

export interface ForEachPath {
  readonly params?: readonly ReusableParam[]
  readonly pathParams?: PathParams
}

export interface Scope<TTags extends DeclaredTags = DeclaredTags>
  extends MethodRoutes<TTags>, Partial<PathRoutes<TTags>>, ForEachPath {
  readonly forEachOp?: ScopeOpts<TTags>
  readonly forEachPath?: ForEachPath
  readonly routes?: ScopeRoutes<TTags>
}

export interface CanonicalScope<
  TTags extends DeclaredTags = DeclaredTags,
> extends Scope<TTags> {
  readonly routes: ScopeRoutes<TTags>
}

export interface ScopeOpts<TTags extends DeclaredTags = DeclaredTags> {
  req?: ReqAugmentation
  res?: ScopeRes
  tags?: OpTags<TTags>
}

/**
 * Route keys are the only keys that make a scope worth declaring; defaults and
 * path-level params are ignored for this validation.
 */
type ScopeRouteKey<T extends Scope> = Extract<keyof T, HttpMethod | HttpPath>

/**
 * Require at least two route keys. A scope with a single endpoint should use
 * the operation helper directly instead of adding an extra scope level.
 *
 * `forEachOp` is ignored here so defaults do not affect the route-shape
 * validation. For single methods, use DSL from {@link file://../methods.ts}
 *
 * Path keys and method keys are counted together, so a scope with `GET` and
 * `/logs` is valid, while a scope with only `/logs` is not.
 *
 * @dsl
 */
type ValidScopeArg<T extends Scope> =
  Pick<T, ScopeRouteKey<T>> extends AtLeastTwo<
    Record<ScopeRouteKey<T>, unknown>
  >
    ? T
    : never

/**
 * Use this when declaring multiple routes under the same subpath. For single
 * methods, use DSL from {@link file://../methods.ts}
 *
 * Scope merge behavior:
 *
 * `forEachOp` is inherited by every nested route and scope.
 *
 * - `req` is additive: parent defaults provide shared mime, params, security, and
 *   request fields, while children extend or narrow them locally.
 * - `tags` are inherited from the nearest containing scope.
 * - `res.defaults` augments matching response ranges, for example to add shared
 *   mime or headers to every `2xx` or `4xx` response.
 * - `res.add` injects whole response entries into each child operation.
 * - If an operation already declares the same status code locally, keep that
 *   response local for now. In practice, `forEachOp.res.add.200` is for sibling
 *   operations that do not already define their own `200`.
 *
 * The `const` type parameter preserves literal method and path keys so the
 * type-level route validation runs before those keys widen to generic strings.
 *
 * @dsl
 */
export function scope<T extends Scope>(arg: ValidScopeArg<T>): Scope {
  return normalizeScope(arg)
}

export function isScope<TTags extends DeclaredTags>(
  s: ScopeOrOp<TTags> | CanonicalScope<TTags>,
): s is CanonicalScope<TTags> {
  return (
    typeof s === "object" &&
    s !== null &&
    !("method" in s) &&
    Object.keys(s).some(
      key =>
        key === "routes" ||
        key === "forEachOp" ||
        key === "forEachPath" ||
        key === "params" ||
        key === "pathParams" ||
        isHttpPathKey(key) ||
        isHttpMethodKey(key),
    )
  )
}

export function normalizeScope<TTags extends DeclaredTags>(
  scopeNode: Scope<TTags> | CanonicalScope<TTags>,
): CanonicalScope<TTags> {
  const routesSource = scopeNode.routes ?? scopeNode
  const routes: ScopeRoutes<TTags> = {}

  for (const key of Object.keys(routesSource)) {
    if (
      key === "routes" ||
      key === "forEachOp" ||
      key === "forEachPath" ||
      key === "params" ||
      key === "pathParams"
    ) {
      continue
    }

    if (isHttpMethodKey(key)) {
      routes[key] = routesSource[key]
      continue
    }

    if (isHttpPathKey(key)) {
      routes[key] = routesSource[key]
    }
  }

  const forEachOp = scopeNode.forEachOp
  const explicitForEachPath = scopeNode.forEachPath
  const legacyParams = scopeNode.params
  const legacyPathParams = scopeNode.pathParams
  const forEachPath =
    explicitForEachPath === undefined &&
    legacyParams === undefined &&
    legacyPathParams === undefined
      ? undefined
      : {
          ...(explicitForEachPath ?? {}),
          ...(legacyParams !== undefined
            ? {
                params: [
                  ...(explicitForEachPath?.params ?? []),
                  ...legacyParams,
                ],
              }
            : {}),
          ...(legacyPathParams !== undefined
            ? {
                pathParams: {
                  ...(explicitForEachPath?.pathParams ?? {}),
                  ...legacyPathParams,
                },
              }
            : {}),
        }

  return {
    ...(forEachOp !== undefined ? { forEachOp } : {}),
    ...(forEachPath !== undefined ? { forEachPath } : {}),
    routes,
  }
}
