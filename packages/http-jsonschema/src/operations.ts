import type { oas31 } from "openapi3-ts"

const httpMethods = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const
export type HttpMethod = (typeof httpMethods)[number]

const methodLookup = new Set<string>(httpMethods)
const isHttpMethod = (x: unknown): x is HttpMethod =>
  typeof x === "string" && methodLookup.has(x)

export interface FullOperation extends oas31.OperationObject {
  /** TODO type OpenApiPath */
  openApiPath: string

  method: HttpMethod
}

const openApiToColon = (openApiPath: string): string =>
  openApiPath
    .split("/")
    .map(part =>
      part.startsWith("{") && part.endsWith("}")
        ? `:${part.slice(1, -1)}`
        : part,
    )
    .join("/")

// const colonToOpenApi = <S extends string>(colonPath: S): string =>
//   colonPath
//     .split("/")
//     .map(part => (part.startsWith(":") ? `{${part.slice(1)}}` : part))
//     .join("/")

export function operationLookup<OpID extends string>(
  paths: oas31.PathsObject,
): {
  ops: Readonly<Record<OpID, FullOperation>>
  openApiPaths: Readonly<Record<string, string>>
  colonPaths: Readonly<Record<string, string>>
} {
  const ops = {} as Record<OpID, FullOperation>
  const openApiPaths = {} as Record<string, string>
  const colonPaths = {} as Record<string, string>

  for (const openApiPath in paths) {
    const path = paths[openApiPath]
    for (const method in path) {
      if (!isHttpMethod(method)) continue

      const op = path[method]
      if (!op?.operationId) {
        throw new Error(`add operationId to ${method} ${openApiPath}`)
      }
      ops[op.operationId as OpID] = { ...op, openApiPath, method }
    }

    const colonPath = openApiToColon(openApiPath)
    openApiPaths[colonPath] = openApiPath
    colonPaths[openApiPath] = colonPath
  }

  return { ops, openApiPaths, colonPaths }
}
