import {
  isRequired,
  parseSchemaOrRef,
  toEnum,
  toStruct,
  typeName,
} from "./schema"
import { isURLPath, mergePaths, parsePath, TypedPath, URLPath } from "./path"
import { OpenAPIV3 } from "openapi-types"
import { deepmerge } from "deepmerge-ts"
import { delUndef } from "./typescript"
import { parseOps } from "./operation"
import { parseScope } from "./scope"
import { kdljs } from "kdljs"

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

type ParamIn = "header" | "cookie" | "path" | "query"

const paramName = (paramIn: ParamIn, s: string): string => {
  switch (paramIn) {
    case "query":
    case "cookie":
      return s

    case "path":
    case "header":
      return s.toLowerCase()
  }
}

export const parseParam = (
  paramIn: ParamIn,
  n: kdljs.Node,
): OpenAPIV3.ParameterObject => ({
  name: paramName(paramIn, getString(n, 0)),
  in: paramIn,
  required: paramIn === "path" ? true : isRequired(n),
  schema: parseSchemaOrRef(n),
})

export const parseHeader = (n: kdljs.Node): OpenAPIV3.HeaderObject => ({
  required: isRequired(n),
  schema: parseSchemaOrRef(n),
})

export const capitalize = <T extends string>(s: T): Capitalize<T> | "" =>
  (s.length ? `${s[0].toUpperCase()}${s.slice(1)}` : s) as Capitalize<T>

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

type Refs = Record<string, OpenAPIV3.SchemaObject>
type Paths = OpenAPIV3.PathsObject

interface FishedScope {
  schemas: Refs
  paths: Paths
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
        schemas[typeName(node)] = toStruct(node)
        break
      }

      case "enum": {
        schemas[typeName(node)] = toEnum(node)
        break
      }

      case "type": {
        const schema = parseSchemaOrRef(node)
        if (isRef(schema)) throw new Error(JSON.stringify(node))

        schemas[getString(node, 0)] = schema
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

      case "scope": {
        scope = deepmerge(scope, parseScope(node))
        break
      }

      default: {
        if (!isURLPath(node.name)) throw new Error(JSON.stringify(node))

        const entered = enterScope(node, {
          path: mergePaths(path, parsePath(node.name)),
          parentScope: scope,
        })
        Object.assign(schemas, entered.schemas)
        Object.assign(paths, entered.paths)
        break
      }
    }
  }

  return { schemas, paths }
}

/**
 * TODO return errors
 */
export const parseOpenAPI = (doc: kdljs.Document): OpenAPIV3.Document => {
  const { info, servers } = topLevel(doc)

  const { schemas, paths } = enterScope(mkNode("", doc), {
    path: { path: "", types: {} },
    parentScope: {},
  })

  return delUndef({
    openapi: "3.0.1",
    info,
    servers,
    components: { schemas },
    paths,
  })
}
