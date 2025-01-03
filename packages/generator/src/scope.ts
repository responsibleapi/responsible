import deepmerge from "deepmerge"
import type kdljs from "kdljs"
import type { OperationObject } from "openapi3-ts/oas31"
import { type Mime } from "./kdl"
import { parseScopeReq } from "./request"
import { parseScopeRes, type ScopeResponses } from "./response"

export interface HasMime {
  mime?: Mime
}

export const parseScope = (n: kdljs.Node): OperationObject => {
  let req: Partial<OperationObject> | undefined
  let responses: ScopeResponses | undefined

  for (const c of n.children) {
    switch (c.name) {
      case "req": {
        req = parseScopeReq(c)
        break
      }

      case "res": {
        responses = parseScopeRes(c)
        break
      }

      default:
        throw new Error(JSON.stringify(c))
    }
  }

  return deepmerge(req ?? {}, responses ? { responses } : {})
}
