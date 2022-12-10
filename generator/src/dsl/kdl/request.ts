import { getString, isRef, Mime, parseParam } from "./kdl"
import { parseBody, replaceStars } from "./operation"
import { parseSchemaOrRef, typeName } from "./schema"
import { isEmpty, myDeepmerge } from "./typescript"
import { OpenAPIV3 } from "openapi-types"
import { HasMime } from "./scope"
import { kdljs } from "kdljs"

type ScopeReq = Partial<OpenAPIV3.OperationObject<HasMime>>

const noMime = <T>(o: T & HasMime): T => {
  const copy = { ...o }
  delete copy.mime
  return copy
}

export const parseScopeReq = (n: kdljs.Node): ScopeReq => {
  if (n.values.length) {
    const mime = n.values.length === 1 ? "*" : (getString(n, 0) as Mime)

    return {
      requestBody:
        typeName(n) === "unknown"
          ? undefined
          : {
              content: { [mime]: { schema: parseSchemaOrRef(n) } },
              required: true,
            },
    }
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

  return {
    mime,
    parameters,
    requestBody: isEmpty(content) ? undefined : { content },
  }
}

const cleanup = (scope: ScopeReq): Partial<OpenAPIV3.OperationObject> => {
  const { requestBody } = scope
  if (isRef(requestBody)) return noMime(scope)

  const content = replaceStars(requestBody?.content, scope.mime)

  const req: ScopeReq = {
    ...scope,
    requestBody: content
      ? { ...requestBody, content, required: true }
      : undefined,
    mime: undefined,
    responses: undefined,
  }

  delete req.mime

  return req
}

export const parseCoreReq = (
  scope: ScopeReq,
  n: kdljs.Node,
): Partial<OpenAPIV3.OperationObject> =>
  cleanup(myDeepmerge(scope, parseScopeReq(n)))
