import type { OpenAPIV3 } from "openapi-types"

export interface FullOperation extends OpenAPIV3.OperationObject {
  path: string
  method: OpenAPIV3.HttpMethods
}

export function collectOps<OpID extends string>(
  paths: OpenAPIV3.PathsObject,
): Record<OpID, FullOperation> {
  const ret = {} as Record<OpID, FullOperation>

  for (const path in paths) {
    for (const m in paths[path]) {
      const method = m as OpenAPIV3.HttpMethods
      const op = paths[path]?.[method]
      if (!op?.operationId) {
        throw new Error(`add operationId to ${method} ${path}`)
      }
      ret[op.operationId as OpID] = { ...op, path, method }
    }
  }

  return ret
}

export const openApiToColon = <S extends string>(openApiPath: S): string =>
  openApiPath
    .split("/")
    .map(part =>
      part.startsWith("{") && part.endsWith("}")
        ? `:${part.slice(1, -1)}`
        : part,
    )
    .join("/")
