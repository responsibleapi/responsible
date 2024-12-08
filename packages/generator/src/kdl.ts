import deepmerge from "deepmerge"
import type kdl from "kdljs"
import type { oas31 } from "openapi3-ts"
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
import { isEmpty, isObject, removeAbsent } from "./typescript"

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

export const getString = (node: kdl.Node, idx: number): string => {
  const v = node.values[idx]
  if (typeof v !== "string") throw new Error(JSON.stringify({ node, idx }))
  return v
}

const toJSObj = <T>(n: kdl.Node, keys?: Set<keyof T>): T =>
  Object.fromEntries(
    n.children.map(c => {
      const k = c.name as keyof T
      if (keys?.size && !keys.has(k)) {
        throw new Error(JSON.stringify({ c, keys }))
      }

      return [k, c.children.length ? toJSObj(c) : c.values[0]]
    }),
  ) as T

const toInfo = (node: kdl.Node): oas31.InfoObject =>
  toJSObj(
    node,
    new Set([
      "title",
      "version",
      "termsOfService",
      "description",
      "license",
      "contact",
    ]),
  )

export const isRef = (x: unknown): x is oas31.ReferenceObject =>
  isObject(x) && "$ref" in x

interface TopLevel {
  info: oas31.InfoObject
  servers?: Array<oas31.ServerObject>
}

type Handlers = Partial<Record<string, (node: kdl.Node) => void>>

const topLevel = (doc: kdl.Document): Readonly<TopLevel> => {
  let info: oas31.InfoObject | undefined
  let servers: oas31.ServerObject[] | undefined

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

interface V3_1ParameterObject extends Omit<oas31.ParameterObject, "schema"> {
  schema: oas31.SchemaObject | oas31.ReferenceObject
}

interface V3_1HeaderObject extends Omit<oas31.HeaderObject, "schema"> {
  schema: oas31.SchemaObject | oas31.ReferenceObject
}

export const parseParam = (
  paramIn: "header" | "cookie" | "query",
  name: string,
  n: kdl.Node,
): V3_1ParameterObject => ({
  name,
  in: paramIn,
  required: isRequired(n),
  schema: parseSchemaOrRef(n),
})

export const parseHeader = (n: kdl.Node): V3_1HeaderObject => ({
  required: isRequired(n),
  schema: parseSchemaOrRef(n),
})

export const mkNode = (
  name: string,
  children?: kdl.Node[],
): Readonly<kdl.Node> => ({
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
): Array<oas31.ParameterObject> =>
  Object.entries(types).map(([name, type]) => ({
    name,
    in: "path",
    required: true,
    schema: parseSchemaOrRef(mkNode(type)),
  }))

interface FishedScope {
  schemas?: oas31.SchemasObject
  securitySchemes?: Record<
    string,
    oas31.SecuritySchemeObject | oas31.ReferenceObject
  >
  paths: oas31.PathsObject
}

type ResponsibleScope = Readonly<Partial<oas31.OperationObject>>

const enterScope = ({
  kdlScope,
  path,
  parentScope,
}: {
  kdlScope: kdl.Node
  path: TypedPath
  parentScope: ResponsibleScope
}): FishedScope => {
  const schemas: Partial<oas31.SchemasObject> = {}

  const paths: oas31.PathsObject = {}

  const securitySchemes: Record<
    string,
    oas31.SecuritySchemeObject | oas31.ReferenceObject
  > = (parentScope as oas31.ComponentsObject).securitySchemes ?? {}

  let scope = parentScope

  // TODO fish for 'scope' first

  for (const node of kdlScope.children) {
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

        const methods: oas31.PathItemObject = paths[thePath.path] ?? {}
        const tempScope = deepmerge(scope, {
          parameters: pathParams(thePath.types),
        })
        const ops = parseOps(tempScope, node)
        Object.assign(methods, ops)
        paths[thePath.path] = methods

        break
      }

      case "*": {
        scope = deepmerge<ResponsibleScope>(scope, parseScope(node))
        break
      }

      case "scope": {
        const pth = getString(node, 0)
        if (!isURLPath(pth)) throw new Error(JSON.stringify(node))

        const entered = enterScope({
          kdlScope: node,
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

  return removeAbsent({
    paths,
    schemas: isEmpty(schemas) ? undefined : (schemas as oas31.SchemasObject),
    securitySchemes: isEmpty(securitySchemes) ? undefined : securitySchemes,
  })
}

/**
 * TODO return errors
 */
export const toOpenAPI = (doc: kdl.Document): oas31.OpenAPIObject => {
  const { info, servers } = topLevel(doc)

  const { schemas, paths, securitySchemes } = enterScope({
    kdlScope: mkNode("", doc),
    path: { path: "", types: {} },
    parentScope: {},
  })

  return removeAbsent({
    openapi: "3.1.0",
    info,
    servers,
    components: { schemas, securitySchemes },
    paths,
  })
}
