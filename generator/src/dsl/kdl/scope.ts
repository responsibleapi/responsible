import { parseScopeRes, ScopeResponses } from "./response"
import { OpenAPIV3 } from "openapi-types"
import { parseScopeReq } from "./request"
import { deepmerge } from "deepmerge-ts"
import { delUndef } from "./typescript"
import { kdljs } from "kdljs"
import { Mime } from "./kdl"

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

  return delUndef(
    deepmerge(req, {
      responses: res as OpenAPIV3.ResponsesObject,
    }),
  )
}
