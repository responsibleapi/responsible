import type { ScopeResponses } from "./response";
import { parseScopeRes } from "./response"
import type { OpenAPIV3 } from "openapi-types"
import { parseScopeReq } from "./request"
import { deepmerge } from "deepmerge-ts"
import type { kdljs } from "kdljs"
import type { Mime } from "./kdl"

export interface HasMime {
  mime?: Mime
}

export const parseScope = (
  n: kdljs.Node,
): Partial<OpenAPIV3.OperationObject> => {
  let req: Partial<OpenAPIV3.OperationObject> | undefined
  let res: ScopeResponses | undefined

  for (const c of n.children) {
    switch (c.name) {
      case "req": {
        req = parseScopeReq(c)
        break
      }

      case "res": {
        res = parseScopeRes(c)
        break
      }

      default:
        throw new Error(JSON.stringify(c))
    }
  }

  return deepmerge(
    req,
    res
      ? {
          responses: res as OpenAPIV3.ResponsesObject,
        }
      : {},
  )
}
