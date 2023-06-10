import { deepmerge } from "deepmerge-ts"
import { type kdljs } from "kdljs"
import { type OpenAPIV3 } from "openapi-types"
import { getString, isMime, mkNode, type Mime } from "./kdl"
import { parseCoreReq } from "./request"
import { parseCoreRes, type ScopeResponses } from "./response"
import { parseSchemaOrRef } from "./schema"
import { capitalize, checkNonNull, noUndef } from "./typescript"

export const replaceStars = (
  content: Record<string, OpenAPIV3.MediaTypeObject> | undefined,
  mime: Mime | undefined,
): Record<string, OpenAPIV3.MediaTypeObject> | undefined => {
  const entries = Object.entries(content ?? {})
  if (!entries.length) return

  return Object.fromEntries(
    entries.map(([k, v]) => (k === "*" ? [checkNonNull(mime), v] : [k, v])),
  )
}

/**
 * merge back to be single parsecontent
 */
export const parseBody = (
  n: kdljs.Node,
): [Mime | "*", OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject] => {
  const schema = parseSchemaOrRef(n)
  const mime = (n.values.find(x => isMime(x)) as Mime) ?? "*"
  return [mime, schema]
}

export const parseOps = (
  scope: Partial<OpenAPIV3.OperationObject>,
  node: kdljs.Node,
): OpenAPIV3.PathItemObject => {
  const method = node.name.toLowerCase() as OpenAPIV3.HttpMethods

  let operationId: string | undefined
  let description: string | undefined

  let req: Partial<OpenAPIV3.OperationObject> | undefined
  let res: OpenAPIV3.ResponsesObject | undefined

  for (const c of node.children) {
    switch (c.name) {
      case "name": {
        operationId = getString(c, 0)
        break
      }

      case "description": {
        description = getString(c, 0)
        break
      }

      case "req": {
        req = parseCoreReq(scope, c)
        break
      }

      case "res": {
        res = parseCoreRes((scope.responses as ScopeResponses) ?? {}, c)
        break
      }

      default:
        throw new Error(JSON.stringify(c))
    }
  }

  if (node.properties.range) {
    throw new Error("TODO ranges are not implemented")
  }

  const empty = mkNode("")
  req ??= parseCoreReq(scope, empty)
  res ??= parseCoreRes((scope.responses as ScopeResponses) ?? {}, empty)

  const op: OpenAPIV3.OperationObject = deepmerge(
    req,
    noUndef({
      operationId,
      description,
      responses: res,
    }),
  )

  const ret: OpenAPIV3.PathItemObject = { [method]: op }

  if (node.properties.head) {
    if (method !== "get") throw new Error(JSON.stringify(node))

    op.operationId = operationId ? `get${capitalize(operationId)}` : undefined

    ret.head = {
      ...op,
      operationId: operationId ? `head${capitalize(operationId)}` : undefined,
      responses: Object.fromEntries(
        Object.entries(op.responses).map(([k, v]) => [
          k,
          noUndef({ ...v, content: undefined }),
        ]),
      ),
    }
  }

  return ret
}
