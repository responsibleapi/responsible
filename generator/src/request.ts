import type { kdljs } from "kdljs"
import type { OpenAPIV3 } from "openapi-types"
import { deepmerge } from "deepmerge-ts"

import type { Mime } from "./kdl"
import { getString, isRef, parseParam } from "./kdl"
import { parseSecurity } from "./security"
import { typeName } from "./schema"
import { parseBody, replaceStars } from "./operation"
import { isEmpty, noUndef } from "./typescript"

interface ReqScope {
  mime?: Mime
  securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject>
}

type ScopeReq = Partial<OpenAPIV3.OperationObject<ReqScope>>

export const parseScopeReq = (parent: kdljs.Node): ScopeReq => {
  if (parent.values.length) {
    const [mime, schema] = parseBody(parent)

    return noUndef({
      requestBody:
        typeName(parent) === "unknown"
          ? undefined
          : {
              content: { [mime]: { schema } },
              required: true,
            },
    })
  }

  let mime: Mime | undefined

  const parameters = Array<OpenAPIV3.ParameterObject>()
  const content: OpenAPIV3.RequestBodyObject["content"] = {}
  const security = Array<OpenAPIV3.SecurityRequirementObject>()
  const securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject> = {}

  for (const node of parent.children) {
    switch (node.name) {
      case "mime": {
        mime = getString(node, 0) as Mime
        break
      }

      case "header": {
        const name = getString(node, 0).toLowerCase()
        parameters.push(parseParam("header", name, node))
        break
      }

      case "headers": {
        for (const header of node.children) {
          const name = header.name.toLowerCase()
          parameters.push(parseParam("header", name, header))
        }
        break
      }

      case "query": {
        if (node.values.length) {
          parameters.push(parseParam("query", getString(node, 0), node))
        } else {
          for (const q of node.children) {
            parameters.push(parseParam("query", q.name, q))
          }
        }
        break
      }

      case "security": {
        const s = parseSecurity(node)
        security.push(...s.security)
        Object.assign(securitySchemes, s.securitySchemes)
        break
      }

      case "body": {
        if (mime) throw new Error("mime already set")

        const [mame, schema] = parseBody(node)
        content[mame] = { schema }
        break
      }

      default:
        throw new Error(JSON.stringify(node))
    }
  }

  return noUndef({
    mime,
    parameters: parameters.length ? parameters : undefined,
    requestBody: isEmpty(content) ? undefined : { content },
    security: security.length ? security : undefined,
    securitySchemes: isEmpty(securitySchemes) ? undefined : securitySchemes,
  })
}

const cleanup = (scope: ScopeReq): Partial<OpenAPIV3.OperationObject> => {
  const { requestBody } = scope

  if (isRef(requestBody)) {
    return noUndef({ ...scope, mime: undefined, responses: undefined })
  }

  const content = replaceStars(requestBody?.content, scope.mime)

  return noUndef({
    ...scope,
    requestBody: content
      ? { ...requestBody, content, required: true }
      : undefined,
    mime: undefined,
    responses: undefined,
    securitySchemes: undefined,
  })
}

export const parseCoreReq = (
  scope: ScopeReq,
  n: kdljs.Node,
): Partial<OpenAPIV3.OperationObject> =>
  cleanup(deepmerge(scope, parseScopeReq(n)))
