import { capitalize, isEmpty, noUndef } from "./typescript"
import { getString, isRef, Mime, parseParam } from "./kdl"
import { parseBody, replaceStars } from "./operation"
import { OpenAPIV3 } from "openapi-types"
import { deepmerge } from "deepmerge-ts"
import { typeName } from "./schema"
import { HasMime } from "./scope"
import { kdljs } from "kdljs"

type ScopeReq = Partial<OpenAPIV3.OperationObject<HasMime>>

const parseSecurities = (
  parent: kdljs.Node,
): ReadonlyArray<OpenAPIV3.ApiKeySecurityScheme> => {
  const ret = Array<OpenAPIV3.ApiKeySecurityScheme>()

  for (const node of parent.children) {
    switch (node.name) {
      case "cookie":
      case "header":
      case "query": {
        ret.push({ type: "apiKey", name: getString(node, 0), in: node.name })
        break
      }

      default: {
        throw new Error(`unknown security type ${node.name}`)
      }
    }
  }

  return ret
}

const toRecord = (
  arr: ReadonlyArray<OpenAPIV3.ApiKeySecurityScheme>,
): Record<string, OpenAPIV3.ApiKeySecurityScheme> =>
  Object.fromEntries(
    arr.map(x => [`${capitalize(x.name)}${capitalize(x.in)}`, x]),
  )

interface ParsedSecurity {
  securitySchemes: Record<string, OpenAPIV3.SecuritySchemeObject>
  security: OpenAPIV3.SecurityRequirementObject[]
}

export const parseSecurity = (parent: kdljs.Node): ParsedSecurity => {
  const node = parent.children[0]
  if (!node) return { securitySchemes: {}, security: [] }

  switch (node.name) {
    case "OR": {
      const securitySchemes = toRecord(parseSecurities(node))
      return {
        securitySchemes,
        security: Object.keys(securitySchemes).map(x => ({ [x]: [] })),
      }
    }

    case "AND": {
      const securitySchemes = toRecord(parseSecurities(node))
      return {
        securitySchemes,
        security: [
          Object.fromEntries(Object.keys(securitySchemes).map(x => [x, []])),
        ],
      }
    }

    default: {
      const securitySchemes = toRecord(parseSecurities(parent))
      const securityKeys = Object.keys(securitySchemes)
      if (securityKeys.length !== 1) {
        throw new Error(`security must be OR or AND or single`)
      }

      return {
        securitySchemes,
        security: [{ [securityKeys[0]]: [] }],
      }
    }
  }
}

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
          parameters.push(parseParam(node.name, getString(node, 0), node))
        } else {
          for (const q of node.children) {
            parameters.push(parseParam(node.name, q.name, q))
          }
        }
        break
      }

      case "security": {
        const s = parseSecurity(node)
        security.push(...s.security)
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
  })
}

export const parseCoreReq = (
  scope: ScopeReq,
  n: kdljs.Node,
): Partial<OpenAPIV3.OperationObject> =>
  cleanup(deepmerge(scope, parseScopeReq(n)))
