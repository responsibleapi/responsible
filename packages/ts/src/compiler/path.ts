import type { HttpPath } from "../dsl/scope.ts"

/** Join a parent path prefix with a route segment. Both use DSL form (`:param`). */
export function joinHttpPaths(prefix: string, segment: HttpPath): string {
  if (prefix === "" || prefix === "/") {
    return segment
  }

  const base =
    prefix.length > 1 && prefix.endsWith("/") ? prefix.slice(0, -1) : prefix

  return base + segment
}

const PARAM_SEGMENT = /:([A-Za-z_][A-Za-z0-9_]*)/g

/** Convert DSL path segments (`:id`) to OpenAPI template form (`{id}`). */
export function dslPathToOpenApiPath(dslPath: string): string {
  return dslPath.replace(PARAM_SEGMENT, "{$1}")
}

/** Parameter names appearing in an OpenAPI path template (`{name}`). */
export function openApiPathTemplateNames(oasPath: string): string[] {
  const names: string[] = []
  const re = /\{([^}]+)\}/g
  let m: RegExpExecArray | null

  while ((m = re.exec(oasPath)) !== null) {
    const name = m[1]

    if (name !== undefined) {
      names.push(name)
    }
  }

  return names
}
