import {
  CoreMethod,
  CoreMimes,
  CoreOp,
  CorePaths,
  CoreResponses,
  CoreServer,
  CoreService,
  CoreStatus,
  CoreTypeRefs,
  ServiceInfo,
  StatusCodeStr,
  URLPath,
} from "../../core/core"
import {
  Mime,
  OptionalBag,
  RequiredBag,
  RStruct,
  RSchema,
  RString,
  SchemaOrRef,
} from "../../core/RSchema"
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

      const v = c.children.length ? toJSObj(c) : stringValue(c, 0)
      return [k, v]
    }),
  ) as T

const toInfo = (node: kdljs.Node): ServiceInfo =>
  toJSObj(node, new Set(["title", "version", "termsOfService"]))

const strToSchema = (name: string): SchemaOrRef =>
  nodeToSchemaOrRef({
    name,
    values: [],
    properties: {},
    children: [],
    tags: { name: "", values: [], properties: {} },
  })

const TAG_OPTIONAL = "?"

const toStruct = (node: kdljs.Node): RStruct => ({
  type: "object",
  fields: Object.fromEntries(
    node.children.map(c => {
      const schema = nodeToSchemaOrRef(c)

      return [
        c.name,
        c.tags.name === TAG_OPTIONAL ? { type: "optional", schema } : schema,
      ]
    }),
  ),
})

const typeName = (n: kdljs.Node): string => {
  if (!n.values.length) return n.name

  const v = n.values[n.values.length - 1]
  if (typeof v !== "string") throw new Error(JSON.stringify(n))

  return v
}

const nodeToSchema = (node: kdljs.Node): RSchema | undefined => {
  const typName = typeName(node)

  switch (typName) {
    case "struct":
      return toStruct(node)

    case "string":
      return { type: "string", ...node.properties }

    case "int32":
    case "int64":
      return { type: "number", format: typName, ...node.properties }

    case "dict": {
      if (
        typeof node.values[1] === "string" &&
        typeof node.values[2] === "string"
      ) {
        return {
          type: "dict",
          k: strToSchema(node.values[1]),
          v: strToSchema(node.values[2]),
        }
      } else {
        throw new Error(JSON.stringify(node))
      }
    }

    case "array": {
      if (typeof node.values[1] === "string") {
        return {
          type: "array",
          items: strToSchema(node.values[1]),
        }
      } else if (node.children.length === 1) {
        return {
          type: "array",
          items: nodeToSchemaOrRef(node.children[0]),
        }
      } else {
        throw new Error(JSON.stringify(node))
      }
    }

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

const nodeToSchemaOrRef = (node: kdljs.Node): SchemaOrRef =>
  nodeToSchema(node) ?? typeName(node)

interface ScopeRes {
  mime?: Mime

  headers: OptionalBag
  cookies: OptionalBag

  body: CoreResponses
}

interface Scope {
  // path: `/${string}` | ""

  req: {
    mime?: Mime
    headers: OptionalBag
    cookies: OptionalBag
    query: OptionalBag
    pathParams: RequiredBag
    // security: {}
  }

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
    body: {},
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
    Object.assign(ret.res.body, opts.res.body)
  }

  return ret
}

const parseCoreStatus = (resChild: kdljs.Node): CoreStatus => {
  const headers: OptionalBag = {}
  const cookies: OptionalBag = {}
  const body: CoreMimes = {}

  for (const statusChild of resChild.children) {
    switch (statusChild.name) {
      case "header": {
        const name = stringValue(statusChild, 0).toLowerCase()
        headers[name] = nodeToSchemaOrRef(statusChild)
        break
      }

      case "headers": {
        for (const header of statusChild.children) {
          headers[header.name.toLowerCase()] = nodeToSchemaOrRef(header)
        }
        break
      }

      case "cookie": {
        const name = stringValue(statusChild, 0)
        cookies[name] = nodeToSchemaOrRef(statusChild)
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
        res.headers[name] = nodeToSchemaOrRef(resChild)
        break
      }

      case "headers": {
        for (const header of resChild.children) {
          const name = header.name.toLowerCase()
          res.headers[name] = nodeToSchemaOrRef(header)
        }
        break
      }

      default: {
        const status = parseInt(resChild.name)
        if (!status) throw new Error(JSON.stringify(resChild))

        const statusStr = resChild.name as StatusCodeStr

        const codeO: CoreStatus = res.body[statusStr] ?? {
          cookies: {},
          headers: {},
          body: {},
        }

        switch (true) {
          case Boolean(resChild.values.length):
            codeO.body["*" as Mime] = nodeToSchemaOrRef(resChild)
            break

          case Boolean(resChild.children.length): {
            for (const statusChild of resChild.children) {
              switch (statusChild.name) {
                case "header": {
                  const name = stringValue(statusChild, 0).toLowerCase()
                  codeO.headers[name] = nodeToSchemaOrRef(statusChild)
                  break
                }

                case "headers": {
                  for (const header of statusChild.children) {
                    codeO.headers[header.name.toLowerCase()] =
                      nodeToSchemaOrRef(header)
                  }
                  break
                }

                case "cookie": {
                  const name = stringValue(statusChild, 0)
                  codeO.cookies[name] = nodeToSchemaOrRef(statusChild)
                  break
                }

                case "body": {
                  const orRef = nodeToSchemaOrRef(statusChild)

                  const mime: Mime =
                    statusChild.values.length === 2
                      ? (stringValue(statusChild, 0) as Mime)
                      : ("*" as Mime)

                  codeO.body[mime] = orRef
                  break
                }

                default:
                  throw new Error(JSON.stringify(statusChild))
              }
            }
            break
          }

          default:
            throw new Error(JSON.stringify(resChild))
        }

        res.body[statusStr] = codeO
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
        req.headers[stringValue(reqNode, 0)] = nodeToSchemaOrRef(reqNode)
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

  if (!req || !res) throw new Error(JSON.stringify(n))

  return { req, res }
}

const toEnum = (node: kdljs.Node): RString => ({
  type: "string",
  enum: node.children.map(x => x.name),
})

const topLevel = (
  doc: kdljs.Document,
): {
  info: ServiceInfo
  servers: ReadonlyArray<CoreServer>
} => {
  let info: ServiceInfo | undefined
  const servers: { url: string }[] = []

  for (const node of doc) {
    switch (node.name) {
      case "responsible": {
        const version = node.properties.syntax
        break
      }

      case "info": {
        info = toInfo(node)
        break
      }

      case "servers": {
        for (const s of node.children) {
          const url = s.values[0]
          if (s.name === "url" && typeof url === "string") {
            servers.push({ url })
          } else {
            throw new Error(JSON.stringify(s))
          }
        }
        break
      }

      default: {
        // everything else parsed as a scope
        break
      }
    }
  }

  if (!info) throw new Error(JSON.stringify(doc))

  return { info: info, servers }
}

interface FishedScope {
  refs: CoreTypeRefs
  paths: CorePaths
}

const parseOps = (
  scope: Scope,
  node: kdljs.Node,
): Partial<Record<CoreMethod, CoreOp>> => {
  const head = node.properties.head === true
  const method = node.name as CoreMethod

  const op: CoreOp = {}

  for (const child of node.children) {
    switch (child.name) {
      case "name": {
        op.name = stringValue(child, 0)
        break
      }

      case "description": {
        op.description = stringValue(child, 0)
        break
      }

      case "req": {
        op.req = {}
        for (const reqChild of child.children) {
          // TODO
        }
        break
      }

      case "res": {
        op.res = parseScopeRes(child)
        break
      }

      default:
        throw new Error(JSON.stringify(child))
    }
  }

  return {
    HEAD: method === "GET" && head ? op : undefined,
    [method]: op,
  }
}

const enterScope = (
  doc: kdljs.Node,
  {
    path,
    parentScope,
  }: {
    path: `/${string}` | ""
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

      case "newType": {
        const schema = nodeToSchema(node)
        if (!schema) throw new Error(JSON.stringify(node))
        refs[stringValue(node, 0)] = { type: "newtype", schema }
        break
      }

      case "HEAD":
      case "DELETE":
      case "POST":
      case "PUT":
      case "GET": {
        const thePath: URLPath = node.values.length
          ? (`${path}${stringValue(node, 0)}` as URLPath)
          : (path as URLPath)

        const xxx: Record<CoreMethod, CoreOp> = paths[thePath] ?? {}
        Object.assign(xxx, parseOps(scope, node))
        paths[thePath] = xxx

        break
      }

      case "scope": {
        scope = mergeScopes(scope, parseScope(node))
        break
      }

      case "pathParam": {
        // TODO scope's path param
        break
      }

      default: {
        if (node.name.startsWith("/")) {
          const entered = enterScope(node, {
            path: `${path}${node.name}` as `/${string}`,
            parentScope: scope,
          })
          Object.assign(refs, entered.refs)
          Object.assign(paths, entered.paths)
          break
        } else {
          throw new Error(JSON.stringify(node))
        }
      }
    }
  }

  return { refs, paths }
}

export const toCore = (doc: kdljs.Document): CoreService => {
  const { info, servers } = topLevel(doc)

  const { refs, paths } = enterScope(
    {
      name: "",
      children: doc,
      values: [],
      tags: { name: "", values: [], properties: {} },
      properties: {},
    },
    {
      path: "",
      parentScope: emptyScope(),
    },
  )

  return { info, servers, refs, paths }
}
