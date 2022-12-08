import { getString, Mime, parseHeader, parseParam, StatusCodeStr } from "./kdl"
import { parseSchemaOrRef } from "./schema"
import { OpenAPIV3 } from "openapi-types"
import { deepmerge } from "deepmerge-ts"
import { kdljs } from "kdljs"

const parseScopeStatus = (node: kdljs.Node): OpenAPIV3.ResponseObject => {
  if (node.values.length) {
    const mime = node.values.length === 1 ? "*" : (getString(node, 0) as Mime)

    return {
      description: node.name,
      content: { [mime]: { schema: parseSchemaOrRef(node) } },
    }
  }

  if (!node.children.length) throw new Error(JSON.stringify(node))

  const headers: NonNullable<OpenAPIV3.ResponseObject["headers"]> = {}
  const content: NonNullable<OpenAPIV3.ResponseObject["content"]> = {}

  for (const statusChild of node.children) {
    switch (statusChild.name) {
      case "header": {
        headers[getString(statusChild, 0)] = parseHeader(statusChild)
        break
      }

      case "headers": {
        for (const header of statusChild.children) {
          headers[header.name] = parseHeader(header)
        }
        break
      }

      case "body": {
        const schema = parseSchemaOrRef(statusChild)

        const mime =
          statusChild.values.length === 2
            ? (getString(statusChild, 0) as Mime)
            : "*"

        content[mime] = { schema }
        break
      }

      default:
        throw new Error(JSON.stringify(statusChild))
    }
  }

  return { description: node.name, headers, content }
}

export interface HasMime {
  mime?: Mime
}

export type ScopeReq = OpenAPIV3.OperationObject & HasMime

const parseScopeReq = (
  node: kdljs.Node,
): OpenAPIV3.OperationObject & HasMime => {
  let mime: Mime | undefined

  const parameters = Array<OpenAPIV3.ParameterObject>()

  for (const reqNode of node.children) {
    switch (reqNode.name) {
      case "mime": {
        mime = getString(reqNode, 0) as Mime
        break
      }

      case "header": {
        parameters.push(parseParam("header", reqNode))
        break
      }

      case "security": {
        // TODO
        break
      }

      default:
        throw new Error(JSON.stringify(reqNode))
    }
  }

  return { mime, parameters, responses: {} }
}

const parseScopeRes = (scopeChild: kdljs.Node): OpenAPIV3.OperationObject => {
  const star: OpenAPIV3.ResponseObject & HasMime = { description: "*" }
  const responses: OpenAPIV3.ResponsesObject = { ["*"]: star }

  for (const resChild of scopeChild.children) {
    switch (resChild.name) {
      case "mime": {
        star.mime = getString(resChild, 0) as Mime
        break
      }

      case "header": {
        star.headers ??= {}
        const name = getString(resChild, 0).toLowerCase()
        star.headers[name] = parseHeader(resChild)
        break
      }

      case "headers": {
        star.headers ??= {}
        for (const header of resChild.children) {
          const name = header.name.toLowerCase()
          star.headers[name] = parseHeader(header)
        }
        break
      }

      default: {
        if (parseInt(resChild.name)) {
          responses[resChild.name as StatusCodeStr] = parseScopeStatus(resChild)
        } else {
          const split = resChild.name.split("..")
          if (split.length !== 2) {
            throw new Error(JSON.stringify(resChild))
          }

          const [start, end] = split.map(parseInt)
          if (!(start && end)) {
            throw new Error(JSON.stringify(resChild))
          }

          responses[`${start}..${end}`] = parseScopeStatus(resChild)
        }
        break
      }
    }
  }

  return { responses }
}

const parseScope = (n: kdljs.Node): OpenAPIV3.OperationObject => {
  let req: OpenAPIV3.OperationObject | undefined
  let res: OpenAPIV3.OperationObject | undefined

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

  const empty: OpenAPIV3.OperationObject = { responses: {} }

  return deepmerge(req ?? empty, res ?? empty)
}
