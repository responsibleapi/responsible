import { getString, isRef, Mime, parseParam } from "./kdl"
import { parseBody, replaceStars } from "./operation"
import { delUndef, isEmpty } from "./typescript"
import { OpenAPIV3 } from "openapi-types"
import { deepmerge } from "deepmerge-ts"
import { typeName } from "./schema"
import { HasMime } from "./scope"
import { kdljs } from "kdljs"

type ScopeReq = Partial<OpenAPIV3.OperationObject<HasMime>>

export const parseScopeReq = (n: kdljs.Node): ScopeReq => {
  if (n.values.length) {
    const [mime, schema] = parseBody(n)

    return delUndef({
      requestBody:
        typeName(n) === "unknown"
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

  for (const c of n.children) {
    switch (c.name) {
      case "mime": {
        mime = getString(c, 0) as Mime
        break
      }

      case "header": {
        parameters.push(parseParam("header", c))
        break
      }

      case "headers": {
        for (const header of c.children) {
          parameters.push(parseParam("header", header))
        }
        break
      }

      case "query": {
        if (c.values.length) {
          parameters.push(parseParam(c.name, c))
        } else {
          for (const q of c.children) {
            parameters.push(parseParam(c.name, q))
          }
        }
        break
      }

      case "security": {
        // TODO
        break
      }

      case "body": {
        if (mime) throw new Error("mime already set")

        const [mame, schema] = parseBody(c)
        content[mame] = { schema }
        break
      }

      default:
        throw new Error(JSON.stringify(c))
    }
  }

  return delUndef({
    mime,
    parameters: parameters.length ? parameters : undefined,
    requestBody: isEmpty(content) ? undefined : { content },
  })
}

const cleanup = (scope: ScopeReq): Partial<OpenAPIV3.OperationObject> => {
  const { requestBody } = scope

  if (isRef(requestBody)) {
    return delUndef({ ...scope, mime: undefined, responses: undefined })
  }

  const content = replaceStars(requestBody?.content, scope.mime)

  return delUndef({
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
