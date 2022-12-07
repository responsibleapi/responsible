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

type SchemaOrRef = OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject

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

const toInfo = (node: kdljs.Node): OpenAPIV3.InfoObject =>
  toJSObj(
    node,
    new Set(["title", "version", "termsOfService", "description", "license"]),
  )

const toNode = (name: string): kdljs.Node => ({
  name,
  values: [],
  properties: {},
  children: [],
  tags: { name: "", values: [], properties: {} },
})

const strToSchema = (name: string): SchemaOrRef =>
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
      const parsed = parseInt(String(node.properties.length))
      const length = isNaN(parsed) ? undefined : parsed

      return {
        minLength: length,
        maxLength: length,
        ...node.properties,
        type: "string",
      }
    }

    case "boolean":
      return { ...node.properties, type: "boolean" }

    case "int32":
    case "int64":
      return { ...node.properties, type: "integer", format: typName }

    case "dict": {
      if (
        typeof node.values[1] === "string" &&
        typeof node.values[2] === "string"
      ) {
        if (typeName(toNode(node.values[1])) !== "string") {
          throw new Error("only string keys are supported")
        }

        return {
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

    case "binary":
      return { type: "string", format: "binary" }

    case "mime":
      return { type: "string", pattern: "^[a-z]+/.+$" }

    case "httpURL":
      return { type: "string", format: "uri", pattern: "^https?:\\/\\/\\S+$" }

    case "nat32":
      return {
        type: "integer",
        format: "int32",
        minimum: 0,
        ...node.properties,
      }

    case "nat64":
      return {
        type: "integer",
        format: "int64",
        minimum: 0,
        ...node.properties,
      }

    case "email":
      return { type: "string", format: "email" }

    case "hostname":
      return { type: "string", format: "hostname" }

    case "seconds":
      // TODO maybe format=seconds?
      return { type: "integer", format: "int64" }

    case "utcMillis":
      // TODO maybe format=millis?
      return { type: "integer", format: "int64" }

    default:
      return undefined
  }
}

const nodeToSchemaOrRef = (n: kdljs.Node): SchemaOrRef =>
  nodeToSchema(n) ?? { $ref: `#/components/schemas/${typeName(n)}` }

// export const toRequiredBag = (types: Record<string, string>): RequiredBag =>
//   Object.fromEntries(
//     Object.entries(types).map(([k, v]) => [k, nodeToSchemaOrRef(mkNode(v))]),
//   )

const isOptional = (node: kdljs.Node): boolean =>
  node.tags.name === TAG_OPTIONAL

const isRef = (x: unknown): x is OpenAPIV3.ReferenceObject =>
  !!x && typeof x === "object" && "$ref" in x

const isSchema = (x: SchemaOrRef): x is OpenAPIV3.SchemaObject => !isRef(x)

type ScopeResK = "*" | StatusCodeStr | `${string}..${string}`

interface ScopeResV {
  mime?: Mime
  headers: Array<[string, OpenAPIV3.HeaderObject]>
  bodies: Array<[Mime | "*", SchemaOrRef]>
}

type ScopeRes = Partial<Record<ScopeResK, ScopeResV>>

interface ScopeReq {
  mime?: Mime
  parameters: Array<OpenAPIV3.ParameterObject>
  // security: {}
}

interface Scope {
  // path: `/${string}` | ""
  req: ScopeReq
  res: ScopeRes
}

const emptyScope = (): Scope => ({
  req: { parameters: [] },
  res: {},
})

const mergeScopeResVs = (arr: ScopeResV[]): ScopeResV => ({
  mime: arr.reduce((acc, x) => x.mime ?? acc, undefined as Mime | undefined),
  headers: arr.flatMap(x => x.headers),
  bodies: arr.flatMap(x => x.bodies),
})

const unq = <T extends string | number>(
  arr: ReadonlyArray<T>,
): ReadonlyArray<T> => [...new Set(arr)]

const mergeScopeReses = (arr: ScopeRes[]): ScopeRes =>
  Object.fromEntries(
    unq(arr.flatMap(x => Object.keys(x) as ScopeResK[])).map(k => [
      k,
      mergeScopeResVs(
        arr.flatMap(x => {
          const scopeResV = x[k]
          return scopeResV ? [scopeResV] : []
        }),
      ),
    ]),
  )

const mergeScopeReqs = (arr: ScopeReq[]): ScopeReq => ({
  mime: arr.reduce((acc: Mime | undefined, x) => x.mime ?? acc, undefined),
  parameters: arr.flatMap(x => x.parameters),
})

const mergeScopes = (arr: ReadonlyArray<Scope>): Readonly<Scope> => ({
  req: mergeScopeReqs(arr.flatMap(x => (x.req ? [x.req] : []))),
  res: mergeScopeReses(arr.flatMap(x => (x.res ? [x.res] : []))),
})

const parseScopeStatus = (resChild: kdljs.Node): ScopeResV => {
  if (resChild.values.length) {
    const mime =
      resChild.values.length === 1 ? "*" : (stringValue(resChild, 0) as Mime)

    return {
      bodies: [[mime, nodeToSchemaOrRef(resChild)]],
      headers: [],
    }
  }

  if (!resChild.children.length) throw new Error(JSON.stringify(resChild))

  const headers = Array<[string, OpenAPIV3.HeaderObject]>()
  const bodies = Array<[Mime | "*", SchemaOrRef]>()

  for (const statusChild of resChild.children) {
    switch (statusChild.name) {
      case "header": {
        headers.push([stringValue(statusChild, 0), parseHeader(statusChild)])
        break
      }

      case "headers": {
        for (const header of statusChild.children) {
          headers.push([header.name, parseHeader(header)])
        }
        break
      }

      case "body": {
        const orRef = nodeToSchemaOrRef(statusChild)

        const mime =
          statusChild.values.length === 2
            ? (stringValue(statusChild, 0) as Mime)
            : "*"

        bodies.push([mime, orRef])
        break
      }

      default:
        throw new Error(JSON.stringify(statusChild))
    }
  }

  return { headers, bodies }
}

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

const parseCoreBody = (
  scope: { mime?: Mime },
  n: kdljs.Node,
): [Mime, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject] => {
  const orRef = nodeToSchemaOrRef(n)

  const mime = n.values.length === 2 ? (stringValue(n, 0) as Mime) : scope.mime

  if (!mime) throw new Error(JSON.stringify(n))

  return [mime, orRef]
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
  const star = <ScopeResV>{ headers: [], bodies: [] }
  const res: ScopeRes = { ["*"]: star }

  for (const resChild of scopeChild.children) {
    switch (resChild.name) {
      case "mime": {
        star.mime = stringValue(resChild, 0) as Mime
        break
      }

      case "header": {
        star.headers.push(parseParam(resChild.name, resChild))
        break
      }

      case "headers": {
        for (const header of resChild.children) {
          star.headers.push(parseParam("header", header))
        }
        break
      }

      default: {
        if (parseInt(resChild.name)) {
          res[resChild.name as StatusCodeStr] = parseScopeStatus(resChild)
        } else {
          const split = resChild.name.split("..")
          if (split.length !== 2) {
            throw new Error(JSON.stringify(resChild))
          }

          const [start, end] = split.map(parseInt)
          if (!(start && end)) {
            throw new Error(JSON.stringify(resChild))
          }

          res[`${start}..${end}`] = parseScopeStatus(resChild)
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

const parseParam = (
  paramIn: ParamIn,
  n: kdljs.Node,
): OpenAPIV3.ParameterObject => ({
  name: paramName(paramIn, stringValue(n, 0)),
  in: paramIn,
  required: paramIn === "path" ? true : isOptional(n),
  schema: nodeToSchemaOrRef(n),
})

const parseHeader = (n: kdljs.Node): OpenAPIV3.HeaderObject => ({
  required: isOptional(n),
  schema: nodeToSchemaOrRef(n),
})

const parseCoreReq = (
  scope: ScopeReq,
  n: kdljs.Node,
): OpenAPIV3.OperationObject => {
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
  const parameters: Array<OpenAPIV3.ParameterObject> = []

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
export const kdlToCore = (doc: kdljs.Document): OpenAPIV3.Document => {
  const { info, servers } = topLevel(doc)

  const { refs, paths } = enterScope(mkNode("", doc), {
    path: { path: "", types: {} },
    parentScope: emptyScope(),
  })

  return { info, servers, refs, paths }
}
