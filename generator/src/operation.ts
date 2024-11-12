import deepmerge from "deepmerge"
import type kdljs from "kdljs"
import type { oas31 } from "openapi3-ts"
import { getString, isMime, mkNode, type Mime } from "./kdl"
import { parseCoreReq } from "./request"
import { parseCoreRes, type ScopeResponses } from "./response"
import { parseSchemaOrRef } from "./schema"
import { capitalize, checkNonNull, cleanObj } from "./typescript"

export const replaceStars = (
  content: Record<string, oas31.MediaTypeObject> | undefined,
  mime: Mime | undefined,
): Record<string, oas31.MediaTypeObject> | undefined => {
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
): [Mime | "*", oas31.SchemaObject | oas31.ReferenceObject] => {
  const schema = parseSchemaOrRef(n)
  const mime = (n.values.find(x => isMime(x)) as Mime) ?? "*"
  return [mime, schema]
}

export const parseOps = (
  scope: Partial<oas31.OperationObject>,
  node: kdljs.Node,
): oas31.PathItemObject => {
  const method = node.name.toLowerCase()

  let operationId: string | undefined
  let description: string | undefined

  let req: Partial<oas31.OperationObject> | undefined
  let res: oas31.ResponsesObject | undefined

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

  const op: oas31.OperationObject = deepmerge(
    req,
    cleanObj({
      operationId,
      description,
      responses: res,
    }),
  )

  const ret: oas31.PathItemObject = { [method]: op }

  if (!node.properties.head) return ret

  if (method !== "get") {
    throw new Error(JSON.stringify(node))
  }

  op.operationId = operationId ? `get${capitalize(operationId)}` : undefined

  ret.head = {
    ...op,
    operationId: operationId ? `head${capitalize(operationId)}` : undefined,
    responses: Object.fromEntries(
      Object.entries(op.responses ?? {}).map(([k, v]) => [
        k,
        cleanObj({
          ...v,
          content: undefined,
        } satisfies oas31.ResponseObject | oas31.ReferenceObject),
      ]),
    ),
  }

  return ret
}
