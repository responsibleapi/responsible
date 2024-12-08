import deepmerge from "deepmerge"
import type kdl from "kdljs"
import type {
  MediaTypeObject,
  OperationObject,
  ParameterObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
} from "openapi3-ts/oas31"
import { getString, isRef, parseParam, type Mime } from "./kdl"
import { parseBody, replaceStars } from "./operation"
import { isRequired, typeName } from "./schema"
import { parseSecurity } from "./security"
import { isEmpty, removeAbsent } from "./typescript"

type ScopeReq = Partial<OperationObject> & {
  mime?: Mime
}

export const parseScopeReq = (parent: kdl.Node): ScopeReq => {
  if (parent.values.length) {
    const [mime, schema] = parseBody(parent)

    return removeAbsent({
      requestBody:
        typeName(parent) === "unknown"
          ? undefined
          : {
              content: { [mime]: { schema } },
              required: isRequired(parent),
            },
    })
  }

  let mime: Mime | undefined

  const parameters = Array<ParameterObject>()
  const content: Record<string, MediaTypeObject> = {}
  const security = Array<SecurityRequirementObject>()
  const securitySchemes: Record<string, SecuritySchemeObject> = {}

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

  return removeAbsent({
    mime,
    parameters,
    requestBody: isEmpty(content) ? undefined : { content },
    security,
    securitySchemes,
  })
}

const partialOp = (merged: ScopeReq): Partial<OperationObject> => {
  const { requestBody } = merged

  if (isRef(requestBody)) {
    return removeAbsent({
      ...merged,
      mime: undefined,
      responses: undefined,
      securitySchemes: undefined,
    })
  }

  const content = replaceStars(requestBody?.content, merged.mime)

  return removeAbsent({
    ...merged,
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
  n: kdl.Node,
): Partial<OperationObject> => partialOp(deepmerge(scope, parseScopeReq(n)))
