import deepmerge from "deepmerge"
import type kdljs from "kdljs"
import type { OpenAPIV3 } from "openapi-types"
import { parseOps } from "./operation"
import {
  isURLPath,
  mergePaths,
  parsePath,
  type TypedPath,
  type URLPath,
} from "./path"
import {
  isRequired,
  parseSchemaOrRef,
  parseStruct,
  toEnum,
  typeName,
} from "./schema"
import { parseScope } from "./scope"
import { cleanObj, isEmpty } from "./typescript"

export type Mime = `${string}/${string}`

export const isMime = (x: unknown): x is Mime =>
  typeof x === "string" && x.length > 2 && x.includes("/")

type StatusCode1 = "1" | "2" | "3" | "4" | "5"
type DigitStr = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type StatusCodeStr = `${StatusCode1}${DigitStr}${DigitStr}`

const isStatusCode = (code: number): boolean =>
  Number.isInteger(code) && code >= 100 && code <= 599

export const isStatusCodeStr = (x: unknown): x is StatusCodeStr =>
  typeof x === "string" && isStatusCode(Number(x))

export const toStatusCode = (code: number): StatusCodeStr => {
  if (isStatusCode(code)) {
    return String(code) as StatusCodeStr
  } else {
    throw new Error(`Invalid status code: ${code}`)
  }
}

export type CoreMethod = "GET" | "HEAD" | "DELETE" | "POST" | "PUT" | "PATCH"

export const getString = (node: kdljs.Node, idx: number): string => {
  const v = node.values[idx]
  if (typeof v !== "string") throw new Error(JSON.stringify({ node, idx }))
  return v
}

const toJSObj = <T>(n: kdljs.Node, keys?: Set<keyof T>): T =>
  Object.fromEntries(
    n.children.map(c => {
      const k = c.name as keyof T
      if (keys?.size && !keys.has(k)) {
        throw new Error(JSON.stringify({ c, keys }))
      }

      return [k, c.children.length ? toJSObj(c) : c.values[0]]
    }),
  ) as T

const toInfo = (node: kdljs.Node): OpenAPIV3.InfoObject =>
  toJSObj(
    node,
    new Set(["title", "version", "termsOfService", "description", "license"]),
  )

export const isRef = (x: unknown): x is OpenAPIV3.ReferenceObject =>
  !!x && typeof x === "object" && "$ref" in x

interface TopLevel {
  info: OpenAPIV3.InfoObject
  servers?: Array<OpenAPIV3.ServerObject>
}

type Handlers = Partial<Record<string, (node: kdljs.Node) => void>>

const topLevel = (doc: kdljs.Document): Readonly<TopLevel> => {
  let info: OpenAPIV3.InfoObject | undefined
  let servers: OpenAPIV3.ServerObject[] | undefined

  const map: Handlers = {
    info(node) {
      info = toInfo(node)
    },

    servers({ children }) {
      servers = children.map(s => {
        const url = s.values[0]
        if (s.name === "url" && typeof url === "string") {
          return { url }
        } else {
          throw new Error(JSON.stringify(s))
        }
      })
    },
  }

  for (const node of doc) {
    map[node.name]?.(node)
  }

  return { info: info ?? { title: "", version: "" }, servers }
}

export const parseParam = (
  paramIn: "header" | "cookie" | "query",
  name: string,
  n: kdljs.Node,
): OpenAPIV3.ParameterObject => ({
  name,
  in: paramIn,
  required: isRequired(n),
  schema: parseSchemaOrRef(n),
})

export const parseHeader = (n: kdljs.Node): OpenAPIV3.HeaderObject => ({
  required: isRequired(n),
  schema: parseSchemaOrRef(n),
})

export const mkNode = (
  name: string,
  children?: kdljs.Node[],
): Readonly<kdljs.Node> => ({
  name,
  values: [],
  properties: {},
  tags: { name: "", values: [], properties: {} },
  children: children ?? [],
})

/**
 * TODO
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
 *
 * multipart/byteranges; boundary=
 *
 * If-Range
 * Content-Range
 *
 * 206 Partial Content
 * 416 Range Not Satisfiable
 */
// const rangeSupport = (node: kdljs.Node): void => {
//   throw new Error("TODO")
//
//   node.properties.head = true
//   const method = node.name as CoreMethod
//
//   if (method !== "GET") throw new Error(JSON.stringify(node))
//
//   const reqH: OptionalBag = op.req.headers ?? {}
//   reqH["range"] = {
//     kind: "optional",
//     schema: { type: "string", minLength: 1 },
//   }
//   op.req.headers = reqH
//
//   for (const status in op.res) {
//     const v = op.res[status as StatusCodeStr]
//     if (!v) continue
//
//     const h: OptionalBag = v.headers ?? {}
//     h["accept-ranges"] = <RString>{ type: "string", enum: ["bytes"] }
//     v.headers = h
//   }
// }

const pathParams = (
  types: Record<string, string>,
): Array<OpenAPIV3.ParameterObject> =>
  Object.entries(types).map(([name, type]) => ({
    name,
    in: "path",
    required: true,
    schema: parseSchemaOrRef(mkNode(type)),
  }))

interface FishedScope {
  schemas?: Record<string, OpenAPIV3.SchemaObject>
  securitySchemes?: Record<
    string,
    OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject
  >
  paths: OpenAPIV3.PathsObject
}

const enterScope = (
  doc: kdljs.Node,
  {
    path,
    parentScope,
  }: {
    path: TypedPath
    parentScope: Readonly<Partial<OpenAPIV3.OperationObject>>
  },
): FishedScope => {
  const schemas: Record<string, OpenAPIV3.SchemaObject> = {}

  const paths: OpenAPIV3.PathsObject = {}

  const securitySchemes: Record<
    string,
    OpenAPIV3.SecuritySchemeObject | OpenAPIV3.ReferenceObject
  > = (parentScope as OpenAPIV3.ComponentsObject).securitySchemes ?? {}

  let scope: Partial<OpenAPIV3.OperationObject> = parentScope

  // TODO fish for 'scope' first

  for (const node of doc.children) {
    switch (node.name) {
      case "responsible":
      case "info":
      case "servers":
        // top level
        break

      case "struct": {
        const name = typeName(node)
        if (schemas[name]) throw new Error(`type ${name} is already defined`)

        schemas[name] = parseStruct(node)
        break
      }

      case "enum": {
        const name = typeName(node)
        if (schemas[name]) throw new Error(`type ${name} is already defined`)

        schemas[name] = toEnum(node)
        break
      }

      case "type": {
        const schema = parseSchemaOrRef(node)
        if (isRef(schema)) throw new Error(JSON.stringify(node))

        const name = getString(node, 0)
        if (schemas[name]) throw new Error(`type ${name} is already defined`)

        schemas[name] = schema
        break
      }

      case "HEAD":
      case "DELETE":
      case "POST":
      case "PUT":
      case "GET": {
        const newPath: URLPath | "" = node.values.length
          ? (getString(node, 0) as URLPath)
          : ""

        const thePath = mergePaths(path, parsePath(newPath))

        if (!isURLPath(thePath.path)) {
          throw new Error(JSON.stringify(node) + "\n" + JSON.stringify(thePath))
        }

        const methods: OpenAPIV3.PathItemObject = paths[thePath.path] ?? {}
        const tempScope = deepmerge(scope, {
          parameters: pathParams(thePath.types),
        })
        const ops = parseOps(tempScope, node)
        Object.assign(methods, ops)
        paths[thePath.path] = methods

        break
      }

      case "*": {
        scope = deepmerge(scope, parseScope(node))
        break
      }

      case "scope": {
        const pth = getString(node, 0)
        if (!isURLPath(pth)) throw new Error(JSON.stringify(node))

        const entered = enterScope(node, {
          path: mergePaths(path, parsePath(pth)),
          parentScope: scope,
        })
        Object.assign(schemas, entered.schemas)
        Object.assign(paths, entered.paths)
        Object.assign(securitySchemes, entered.securitySchemes)
        break
      }

      default: {
        throw new Error(
          `${node.name} ${node.values.join(" ")} not supported in top level`,
        )
      }
    }
  }

  return cleanObj({
    paths,
    schemas: isEmpty(schemas) ? undefined : schemas,
    securitySchemes: isEmpty(securitySchemes) ? undefined : securitySchemes,
  })
}

/**
 * TODO return errors
 */
export const parseOpenAPI = (doc: kdljs.Document): OpenAPIV3.Document => {
  const { info, servers } = topLevel(doc)

  const { schemas, paths, securitySchemes } = enterScope(mkNode("", doc), {
    path: { path: "", types: {} },
    parentScope: {},
  })

  return cleanObj({
    openapi: "3.0.1",
    info,
    servers,
    components: { schemas, securitySchemes },
    paths,
  })
}
