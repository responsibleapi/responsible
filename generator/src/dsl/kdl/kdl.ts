import {
  CoreMethod,
  CoreMimes,
  CoreOp,
  CorePaths,
  CoreReq,
  CoreRes,
  CoreServer,
  CoreService,
  CoreStatus,
  CoreTypeRefs,
  isURLPath,
  ServiceInfo,
  StatusCodeStr,
  URLPath,
} from "../../core/core"
import { Mime, OptionalBag, RequiredBag, RString } from "../../core/schema"
import { mergePaths, parsePath, TypedPath } from "./path"
import { OpenAPIV3 } from "openapi-types"
import { kdljs } from "kdljs"

const stringValue = (node: kdljs.Node, idx: number): string => {
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

const toInfo = (node: kdljs.Node): ServiceInfo =>
  toJSObj(node, new Set(["title", "version", "termsOfService"]))

const toNode = (name: string) => ({
  name,
  values: [],
  properties: {},
  children: [],
  tags: { name: "", values: [], properties: {} },
})

const strToSchema = (
  name: string,
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject =>
  nodeToSchemaOrRef(toNode(name))

const TAG_OPTIONAL = "?"

const toStruct = (node: kdljs.Node): OpenAPIV3.NonArraySchemaObject => ({
  type: "object",
  properties: Object.fromEntries(
    node.children.map(x => [x.name, nodeToSchemaOrRef(x)]),
  ),
  required: node.children.flatMap(x => (isOptional(x) ? [x.name] : [])),
})

const typeName = (n: kdljs.Node): string => {
  if (!n.values.length) return n.name

  if (n.values.length >= 3 && n.values[n.values.length - 3] === "dict") {
    return "dict"
  }

  if (n.values.length >= 2 && n.values[n.values.length - 2] === "array") {
    return "array"
  }

  const last = n.values[n.values.length - 1]
  if (typeof last !== "string") throw new Error(JSON.stringify(n))
  return last
}

/**
 * application/json
 * application/json; charset=utf-8
 * application/xml+rss
 */
const regexForMimeType = "\\w+/.+"

const nodeToSchema = (node: kdljs.Node): OpenAPIV3.SchemaObject | undefined => {
  const typName = typeName(node)

  switch (typName) {
    case "unknown":
      return { nullable: true }

    case "enum":
      return toEnum(node)

    case "struct":
      return toStruct(node)

    case "dateTime": {
      return <OpenAPIV3.NonArraySchemaObject>{
        ...node.properties,
        type: "string",
        format: "date-time",
      }
    }

    case "string": {
      const length = parseInt(String(node.properties.length)) || undefined

      return <OpenAPIV3.NonArraySchemaObject>{
        minLength: length,
        maxLength: length,
        ...node.properties,
        type: "string",
      }
    }

    case "boolean":
      return <OpenAPIV3.NonArraySchemaObject>{
        ...node.properties,
        type: "boolean",
      }

    case "int32":
    case "int64":
      return <OpenAPIV3.NonArraySchemaObject>{
        ...node.properties,
        type: "integer",
        format: typName,
      }

    case "dict": {
      if (
        typeof node.values[1] === "string" &&
        typeof node.values[2] === "string"
      ) {
        if (typeName(toNode(node.values[1])) !== "string") {
          throw new Error("only string keys are supported")
        }

        return <OpenAPIV3.NonArraySchemaObject>{
          ...node.properties,
          type: "object",
          additionalProperties: strToSchema(node.values[2]),
        }
      } else {
        throw new Error(JSON.stringify(node))
      }
    }

    case "array": {
      const last = node.values[node.values.length - 1]
      if (typeof last === "string" && last !== "array") {
        return <OpenAPIV3.ArraySchemaObject>{
          ...node.properties,
          type: "array",
          items: strToSchema(last),
        }
      } else if (node.children.length === 1) {
        return <OpenAPIV3.ArraySchemaObject>{
          ...node.properties,
          type: "array",
          items: nodeToSchemaOrRef(node.children[0]),
        }
      } else {
        throw new Error(JSON.stringify(node))
      }
    }

    case "mime":
      return { type: "string", pattern: regexForMimeType }

    case "httpURL":
    case "nat32":
    case "nat64":
    case "email":
    case "hostname":
    case "seconds":
    case "utcMillis":
      return { type: "runtime-library", name: typName }

    default:
      return undefined
  }
}

const nodeToSchemaOrRef = (
  node: kdljs.Node,
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject =>
  nodeToSchema(node) ?? { $ref: typeName(node) }

export const toRequiredBag = (types: Record<string, string>): RequiredBag =>
  Object.fromEntries(
    Object.entries(types).map(([k, v]) => [k, nodeToSchemaOrRef(mkNode(v))]),
  )

const isOptional = (node: kdljs.Node): boolean =>
  node.tags.name === TAG_OPTIONAL

const isSchema = (
  x: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
): x is OpenAPIV3.SchemaObject => !("$ref" in x)

interface ScopeRes {
  mime?: Mime

  headers: OptionalBag
  cookies: OptionalBag

  codes: CoreRes
}

interface ScopeReq {
  mime?: Mime
  headers: OptionalBag
  cookies: OptionalBag
  query: OptionalBag
  pathParams: RequiredBag
  // security: {}
}

interface Scope {
  // path: `/${string}` | ""
  req: ScopeReq
  res: ScopeRes
}

const emptyScope = (): Scope => ({
  req: {
    headers: {},
    cookies: {},
    query: {},
    pathParams: {},
  },
  res: {
    headers: {},
    codes: {},
    cookies: {},
  },
})

const mergeScopes = (
  ...arr: ReadonlyArray<Scope | undefined>
): Readonly<Scope> => {
  const ret: Scope = emptyScope()

  for (const opts of arr) {
    if (!opts) continue

    ret.req.mime = opts.req.mime ?? ret.req.mime
    Object.assign(ret.req.headers, opts.req.headers)
    Object.assign(ret.req.cookies, opts.req.cookies)
    Object.assign(ret.req.query, opts.req.query)
    Object.assign(ret.req.pathParams, opts.req.pathParams)

    ret.res.mime = opts.res.mime ?? ret.res.mime
    Object.assign(ret.res.headers, opts.res.headers)
    Object.assign(ret.res.codes, opts.res.codes)
  }

  return ret
}

const parseScopeStatus = (resChild: kdljs.Node): CoreStatus => {
  if (resChild.values.length) {
    const mime: Mime = (
      resChild.values.length === 1 ? "*" : stringValue(resChild, 0)
    ) as Mime

    return { body: { [mime]: nodeToSchemaOrRef(resChild) } }
  }

  if (!resChild.children.length) throw new Error(JSON.stringify(resChild))

  const headers: OptionalBag = {}
  const cookies: OptionalBag = {}
  const body: CoreMimes = {}

  for (const statusChild of resChild.children) {
    switch (statusChild.name) {
      case "header": {
        const name = stringValue(statusChild, 0).toLowerCase()
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
        const name = stringValue(statusChild, 0)
        cookies[name] = optionalSchema(statusChild)
        break
      }

      case "body": {
        const orRef = nodeToSchemaOrRef(statusChild)

        const mime: Mime =
          statusChild.values.length === 2
            ? (stringValue(statusChild, 0) as Mime)
            : ("*" as Mime)

        body[mime] = orRef
        break
      }

      default:
        throw new Error(JSON.stringify(statusChild))
    }
  }

  return { headers, cookies, body }
}

const parseCoreRes = (scope: ScopeRes, res: kdljs.Node): CoreRes => {
  const ret: CoreRes = {}

  for (const status in scope.codes) {
    const scs = status as StatusCodeStr
    const coreStatus = scope.codes[scs]
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

const parseCoreBody = (
  scope: { mime?: Mime },
  n: kdljs.Node,
): [Mime, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject] => {
  const orRef = nodeToSchemaOrRef(n)

  const mime: Mime | undefined =
    n.values.length === 2 ? (stringValue(n, 0) as Mime) : scope.mime

  if (!mime) throw new Error(JSON.stringify(n))

  return [mime, orRef]
}

const parseCoreStatus = (
  scope: ScopeRes,
  statusNode: kdljs.Node,
): CoreStatus => {
  const scopeStatus = scope.codes[statusNode.name as StatusCodeStr]

  if (statusNode.values.length) {
    return {
      headers: { ...scope.headers, ...scopeStatus?.headers },
      cookies: { ...scope.cookies, ...scopeStatus?.cookies },
      body: scope.mime ? { [scope.mime]: nodeToSchemaOrRef(statusNode) } : {},
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
        const name = stringValue(statusChild, 0).toLowerCase()
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
        const name = stringValue(statusChild, 0)
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

const parseScopeRes = (scopeChild: kdljs.Node): ScopeRes => {
  const res: ScopeRes = emptyScope().res

  for (const resChild of scopeChild.children) {
    switch (resChild.name) {
      case "mime": {
        res.mime = stringValue(resChild, 0) as Mime
        break
      }

      case "header": {
        const name = stringValue(resChild, 0).toLowerCase()
        res.headers[name] = optionalSchema(resChild)
        break
      }

      case "headers": {
        for (const header of resChild.children) {
          const name = header.name.toLowerCase()
          res.headers[name] = optionalSchema(header)
        }
        break
      }

      default: {
        if (parseInt(resChild.name)) {
          res.codes[resChild.name as StatusCodeStr] = parseScopeStatus(resChild)
        } else {
          throw new Error(JSON.stringify(resChild))
        }
        break
      }
    }
  }

  return res
}

const parseScopeReq = (scopeChild: kdljs.Node): Scope["req"] => {
  const req: Scope["req"] = emptyScope().req

  for (const reqNode of scopeChild.children) {
    switch (reqNode.name) {
      case "mime": {
        req.mime = stringValue(reqNode, 0) as Mime
        break
      }

      case "header": {
        const name = stringValue(reqNode, 0)
        req.headers[name] = optionalSchema(reqNode)
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

  return req
}

const parseScope = (n: kdljs.Node): Readonly<Scope> => {
  let req: Scope["req"] | undefined
  let res: ScopeRes | undefined

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

  const e = emptyScope()
  req ??= e.req
  res ??= e.res

  return { req, res }
}

const toEnum = (node: kdljs.Node): OpenAPIV3.NonArraySchemaObject => ({
  type: "string",
  enum: node.children.map(x => x.name),
})

interface TopLevel {
  syntaxVersion?: string
  info: ServiceInfo
  servers?: ReadonlyArray<CoreServer>
}

type Handlers = Partial<Record<string, (node: kdljs.Node) => void>>

const topLevel = (doc: kdljs.Document): Readonly<TopLevel> => {
  let syntaxVersion: string | undefined
  let info: ServiceInfo | undefined
  let servers: CoreServer[] | undefined

  const map: Handlers = {
    responsible({ properties }) {
      syntaxVersion = properties.syntax as string
    },

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

  return { syntaxVersion, info: info ?? { title: "", version: "" }, servers }
}

interface FishedScope {
  refs: CoreTypeRefs
  paths: CorePaths
}

const parseCoreReq = (scope: ScopeReq, n: kdljs.Node): CoreReq => {
  if (n.values.length) {
    if (!scope.mime) throw new Error(JSON.stringify(n))

    return {
      headers: scope.headers,
      cookies: scope.cookies,
      pathParams: scope.pathParams,
      query: scope.query,
      body: { [scope.mime]: nodeToSchemaOrRef(n) },
    }
  }

  const headers: OptionalBag = {}
  const pathParams: RequiredBag = {}
  const query: OptionalBag = {}
  const body: Array<
    [Mime, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject]
  > = []

  for (const c of n.children) {
    switch (c.name) {
      case "header": {
        const name = stringValue(c, 0).toLowerCase()
        headers[name] = optionalSchema(c)
        break
      }

      case "query": {
        if (c.values.length) {
          const name = stringValue(c, 0)
          query[name] = optionalSchema(c)
        } else {
          for (const q of c.children) {
            query[q.name] = optionalSchema(q)
          }
        }
        break
      }

      case "body": {
        body.push(parseCoreBody(scope, c))
        break
      }

      default:
        throw new Error(JSON.stringify(c))
    }
  }

  return {
    headers: { ...scope.headers, ...headers },
    pathParams: { ...scope.pathParams, ...pathParams },
    query: { ...scope.query, ...query },
    body: Object.fromEntries(body),
  }
}

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

const parseOps = (
  scope: Scope,
  node: kdljs.Node,
): Partial<Record<CoreMethod, CoreOp>> => {
  const method = node.name as CoreMethod

  let name: string | undefined
  let description: string | undefined
  let req: CoreReq | undefined
  let res: CoreRes | undefined

  for (const child of node.children) {
    switch (child.name) {
      case "name": {
        name = stringValue(child, 0)
        break
      }

      case "description": {
        description = stringValue(child, 0)
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

const TODOrangeSupport = (node: kdljs.Node): void => {
  node.properties.head = true
  const method = node.name as CoreMethod

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
  const refs: CoreTypeRefs = {}
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

      case "external": {
        refs[typeName(node)] = { type: "external" }
        break
      }

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
        refs[stringValue(node, 0)] = schema
        break
      }

      case "HEAD":
      case "DELETE":
      case "POST":
      case "PUT":
      case "GET": {
        const newPath: URLPath | "" = node.values.length
          ? (stringValue(node, 0) as URLPath)
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
export const kdlToCore = (doc: kdljs.Document): CoreService => {
  const { info, servers } = topLevel(doc)

  const { refs, paths } = enterScope(mkNode("", doc), {
    path: { path: "", types: {} },
    parentScope: emptyScope(),
  })

  return { info, servers, refs, paths }
}
