import { capitalize, getString, Mime, parseParam, StatusCodeStr } from "./kdl"
import { parseSchemaOrRef } from "./schema"
import { HasMime, ScopeReq } from "./scope"
import { OpenAPIV3 } from "openapi-types"
import { deepmerge } from "deepmerge-ts"
import { kdljs } from "kdljs"

const parseCoreBody = (
  scope: HasMime,
  n: kdljs.Node,
): [Mime, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject] => {
  const orRef = parseSchemaOrRef(n)

  const mime = n.values.length === 2 ? (getString(n, 0) as Mime) : scope.mime

  if (!mime) throw new Error(JSON.stringify(n))

  return [mime, orRef]
}

const noMime = <T>(o: T & HasMime): T => {
  const copy = { ...o }
  delete copy.mime
  return copy
}

const parseCoreReq = (
  scope: ScopeReq,
  n: kdljs.Node,
): OpenAPIV3.OperationObject => {
  if (n.values.length) {
    if (!scope.mime) throw new Error(JSON.stringify(n))

    return deepmerge(noMime(scope), {
      requestBody: {
        content: { [scope.mime]: { schema: parseSchemaOrRef(n) } },
      },
    })
  }

  const parameters: Array<OpenAPIV3.ParameterObject> = []
  const content: OpenAPIV3.RequestBodyObject["content"] = {}

  for (const c of n.children) {
    switch (c.name) {
      case "header": {
        parameters.push(parseParam(c.name, c))
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

      case "body": {
        const [mime, schema] = parseCoreBody(scope, c)
        content[mime] = { schema }
        break
      }

      default:
        throw new Error(JSON.stringify(c))
    }
  }

  return deepmerge(noMime(scope), {
    parameters,
    requestBody: { content },
  })
}

const parseCoreStatus = (
  scope: ScopeRes,
  statusNode: kdljs.Node,
): OpenAPIV3.ResponseObject => {
  const scopeStatus = scope.codes[statusNode.name as StatusCodeStr]

  if (statusNode.values.length) {
    return {
      headers: { ...scope.headers, ...scopeStatus?.headers },
      cookies: { ...scope.cookies, ...scopeStatus?.cookies },
      body: scope.mime ? { [scope.mime]: parseSchemaOrRef(statusNode) } : {},
    }
  }

  const headers: OptionalBag = {}
  const cookies: OptionalBag = {}
  const body: Array<
    [Mime, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject]
  > = []

  for (const statusChild of statusNode.children) {
    switch (statusChild.name) {
      case "header": {
        const name = getString(statusChild, 0).toLowerCase()
        headers[name] = optionalSchema(statusChild)
        break
      }

      case "headers": {
        for (const header of statusChild.children) {
          const name = header.name.toLowerCase()
          headers[name] = optionalSchema(header)
        }
        break
      }

      case "cookie": {
        const name = getString(statusChild, 0)
        cookies[name] = optionalSchema(statusChild)
        break
      }

      case "body": {
        body.push(parseCoreBody(scope, statusChild))
        break
      }

      default:
        throw new Error(JSON.stringify(statusChild))
    }
  }

  return {
    headers: { ...scope.headers, ...scopeStatus?.headers, ...headers },
    cookies: { ...scope.cookies, ...scopeStatus?.cookies, ...cookies },
    body: Object.fromEntries(body),
  }
}

const parseOps = (
  scope: OpenAPIV3.OperationObject,
  node: kdljs.Node,
): OpenAPIV3.PathItemObject => {
  const method = node.name as CoreMethod

  let name: string | undefined
  let description: string | undefined
  let req: OpenAPIV3.OperationObject | undefined
  let res: OpenAPIV3.OperationObject | undefined

  for (const child of node.children) {
    switch (child.name) {
      case "name": {
        name = getString(child, 0)
        break
      }

      case "description": {
        description = getString(child, 0)
        break
      }

      case "req": {
        req = parseCoreReq(scope.req, child)
        break
      }

      case "res": {
        res = parseCoreRes(scope.res, child)
        break
      }

      default:
        throw new Error(JSON.stringify(child))
    }
  }

  req ??= parseCoreReq(scope.req, EMPTY_NODE)
  res ??= parseCoreRes(scope.res, EMPTY_NODE)

  const op: CoreOp = { req, name, description, res }
  const ret: Partial<Record<CoreMethod, CoreOp>> = { [method]: op }

  if (node.properties.range) {
    throw new Error("TODO ranges are not implemented")
  }

  if (node.properties.head) {
    if (method !== "GET") throw new Error(JSON.stringify(node))

    op.name = name ? `get${capitalize(name)}` : undefined

    ret.HEAD = {
      ...op,
      name: name ? `head${capitalize(name)}` : undefined,
    }
  }

  return ret
}
