import { isOptional, parseSchemaOrRef, SchemaOrRef } from "./schema"
import { mergePaths, parsePath, TypedPath } from "./path"
import { OpenAPIV3 } from "openapi-types"
import { kdljs } from "kdljs"

export type Mime = `${string}/${string}`

export const isMime = (x: unknown): x is Mime =>
  typeof x === "string" && x.length > 2 && x.includes("/")

type StatusCode1 = "1" | "2" | "3" | "4" | "5"
type DigitStr = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type StatusCodeStr = `${StatusCode1}${DigitStr}${DigitStr}`

export const toStatusCode = (code: number): StatusCodeStr => {
  if (code >= 100 && code <= 599) {
    return String(code) as StatusCodeStr
  } else {
    throw new Error(`Invalid status code: ${code}`)
  }
}

type CoreMethod = "GET" | "HEAD" | "DELETE" | "POST" | "PUT" | "PATCH"

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

const isRef = (x: unknown): x is OpenAPIV3.ReferenceObject =>
  !!x && typeof x === "object" && "$ref" in x

const isSchema = (x: SchemaOrRef): x is OpenAPIV3.SchemaObject => !isRef(x)

const unq = <T extends string | number>(
  arr: ReadonlyArray<T>,
): ReadonlyArray<T> => [...new Set(arr)]

const toResponse = (
  status: StatusCodeStr,
  s: ScopeResV,
): OpenAPIV3.ResponseObject => {
  return {
    description: status,
    headers: Object.fromEntries(s.headers.map(([k, v]) => [k, v])),
    content: Object.fromEntries(
      s.bodies.map(([mime, schema]) => [
        mime,
        <OpenAPIV3.MediaTypeObject>{ schema },
      ]),
    ),
  }
}

/**
 * 0. add statuses from the scope
 * 1. parse the responses
 * 2. apply scope to the responses
 */
const parseCoreRes = (
  scope: ScopeRes,
  res: kdljs.Node,
): OpenAPIV3.ResponsesObject => {
  const ret: OpenAPIV3.ResponsesObject = {}

  // 0. add statuses from the scope
  for (const status of Object.keys(scope).filter(x => parseInt(x))) {
    const k = status as StatusCodeStr
    const v = scope[k]
    if (!v) continue

    ret[status] = toResponse(k, v)
  }

  // 1. add empty responses for operation statuses
  for (const c of res.children) {
    if (!parseInt(c.name)) throw new Error(JSON.stringify(c))

    ret[c.name] = { description: c.name }
  }

  // 2. apply scope to the responses
  const star = scope["*"]
  if (star) {
    for (const k in ret) {
      const r = ret[k]
      if (isRef(r)) continue

      for (const [name, h] of star.headers) {
        r.headers[name] = h
      }
    }
  }

  // 3. add real responses for the operation
  for (const c of res.children) {
    if (!parseInt(c.name)) throw new Error(JSON.stringify(c))

    ret[c.name] = { description: c.name }
  }

  for (const status in scope) {
    const scs = status as StatusCodeStr
    const coreStatus = scope[scs]
    if (!coreStatus) continue

    ret[scs] = {
      headers: scope.headers,
      cookies: scope.cookies,
      ...coreStatus,
      body: Object.fromEntries(
        Object.entries(coreStatus.body).map(([k, v]) => {
          if (!scope.mime) throw new Error(JSON.stringify(scope))

          return k === "*" ? [scope.mime, v] : [k as Mime, v]
        }),
      ),
    }
  }

  for (const c of res.children) {
    if (!parseInt(c.name)) throw new Error(JSON.stringify(c))

    ret[c.name as StatusCodeStr] = parseCoreStatus(scope, c)
  }

  return ret
}

interface TopLevel {
  info: OpenAPIV3.InfoObject
  servers?: ReadonlyArray<OpenAPIV3.ServerObject>
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
  required: paramIn === "path" ? true : isOptional(n),
  schema: parseSchemaOrRef(n),
})

export const parseHeader = (n: kdljs.Node): OpenAPIV3.HeaderObject => ({
  required: isOptional(n),
  schema: parseSchemaOrRef(n),
})

export const capitalize = <T extends string>(s: T): Capitalize<T> | "" =>
  (s.length ? `${s[0].toUpperCase()}${s.slice(1)}` : s) as Capitalize<T>

const mkNode = (
  name: string,
  children?: kdljs.Node[],
): Readonly<kdljs.Node> => ({
  name,
  values: [],
  properties: {},
  tags: { name: "", values: [], properties: {} },
  children: children ?? [],
})

const EMPTY_NODE = mkNode("")


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
const rangeSupport = (node: kdljs.Node): void => {
  throw new Error("TODO")

  node.properties.head = true
  const method = node.name as CoreMethod

  if (method !== "GET") throw new Error(JSON.stringify(node))

  const reqH: OptionalBag = op.req.headers ?? {}
  reqH["range"] = {
    kind: "optional",
    schema: { type: "string", minLength: 1 },
  }
  op.req.headers = reqH

  for (const status in op.res) {
    const v = op.res[status as StatusCodeStr]
    if (!v) continue

    const h: OptionalBag = v.headers ?? {}
    h["accept-ranges"] = <RString>{ type: "string", enum: ["bytes"] }
    v.headers = h
  }
}

const enterScope = (
  doc: kdljs.Node,
  {
    path,
    parentScope,
  }: {
    path: TypedPath
    parentScope: Readonly<Scope>
  },
): FishedScope => {
  const refs: Record<string, OpenAPIV3.SchemaObject> = {}
  const paths: CorePaths = {}

  let scope: Scope = parentScope

  // TODO fish for 'scope' first

  for (const node of doc.children) {
    switch (node.name) {
      case "responsible":
      case "info":
      case "servers":
        // top level
        break

      case "struct": {
        refs[typeName(node)] = toStruct(node)
        break
      }

      case "enum": {
        refs[typeName(node)] = toEnum(node)
        break
      }

      case "type": {
        const schema = nodeToSchema(node)
        if (!schema) throw new Error(JSON.stringify(node))
        refs[getString(node, 0)] = schema
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

        const methods: Partial<Record<CoreMethod, CoreOp>> =
          paths[thePath.path] ?? {}

        const tempScope = {
          ...scope,
          req: {
            ...scope.req,
            pathParams: {
              ...scope.req.pathParams,
              ...toRequiredBag(thePath.types),
            },
          },
        }
        Object.assign(methods, parseOps(tempScope, node))
        paths[thePath.path] = methods

        break
      }

      case "scope": {
        scope = mergeScopes(scope, parseScope(node))
        break
      }

      default: {
        if (!isURLPath(node.name)) throw new Error(JSON.stringify(node))

        const entered = enterScope(node, {
          path: mergePaths(path, parsePath(node.name)),
          parentScope: scope,
        })
        Object.assign(refs, entered.refs)
        Object.assign(paths, entered.paths)
        break
      }
    }
  }

  return { refs, paths }
}

/**
 * TODO return errors
 */
export const kdlToCore = (doc: kdljs.Document): OpenAPIV3.Document => {
  const { info, servers } = topLevel(doc)

  const { refs, paths } = enterScope(mkNode("", doc), {
    path: { path: "", types: {} },
    parentScope: emptyScope(),
  })

  return { info, servers, refs, paths }
}
