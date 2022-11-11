import {
  CoreMimes,
  CorePaths,
  CoreServer,
  CoreService,
  CoreTypeRefs,
  ServiceInfo,
  StatusCodeStr,
} from "../../core/core"
import {
  Mime,
  OptionalBag,
  RequiredBag,
  RObject,
  RSchema,
  RString,
  SchemaOrRef,
} from "../../core/endpoint"
import { kdljs } from "kdljs"

const stringValue = (node: kdljs.Node, idx: number): string => {
  const v = node.values[idx]
  if (typeof v !== "string") throw new Error(JSON.stringify({ node, idx }))
  return v
}

const toInfo = (node: kdljs.Node): ServiceInfo => {
  let title: string | undefined
  let version: string | undefined

  for (const child of node.children) {
    const v1 = stringValue(child, 0)

    switch (child.name) {
      case "title":
        title = v1
        break

      case "version":
        version = v1
        break
    }
  }

  if (!title || !version) throw new Error(JSON.stringify(node))

  return { title, version }
}

const strToSchema = (name: string): SchemaOrRef =>
  nodeToSchemaOrRef({
    name,
    values: [],
    properties: {},
    children: [],
    tags: { name: "", values: [], properties: {} },
  })

const TAG_OPTIONAL = "?"

const toStruct = (node: kdljs.Node): RObject => ({
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

interface Scope {
  path: `/${string}` | ""

  req: {
    mime?: Mime
    // security: {}
  }

  res: {
    mime?: Mime

    headers: OptionalBag
    cookies: OptionalBag
    query: OptionalBag
    pathParams: RequiredBag

    codes: Record<
      StatusCodeStr,
      {
        body?: CoreMimes | SchemaOrRef
        headers: OptionalBag
        cookies: OptionalBag
        query: OptionalBag
        pathParams: RequiredBag
      }
    >
  }
}

const toScope = (scope: kdljs.Node): Scope => {
  for (const scopeChild of scope.children) {
    switch (scopeChild.name) {
      case "req": {
        for (const reqNode of scopeChild.children) {
          switch (reqNode.name) {
            case "mime": {
              break
            }

            case "header": {
              break
            }
          }
        }
        break
      }

      case "res": {
        for (const resChild of scopeChild.children) {
          switch (resChild.name) {
            case "mime": {
              break
            }

            default: {
              const status = parseInt(resChild.name)
              if (status) {
                if (resChild.values.length) {
                } else if (resChild.children.length) {
                } else {
                  throw new Error(JSON.stringify(resChild))
                }
              } else {
                throw new Error(JSON.stringify(resChild))
              }
              break
            }
          }
        }
        break
      }
    }
  }
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
    }
  }

  if (!info) throw new Error(JSON.stringify(doc))

  return { info: info, servers }
}

interface FishedScope {
  refs: CoreTypeRefs
  paths: CorePaths
}

const enterScope = (doc: kdljs.Node): FishedScope => {
  const refs: CoreTypeRefs = {}
  const paths: CorePaths = {}

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
        if (node.values.length) {
          const appendPath = stringValue(node, 0)
        }
        const head = node.properties.head === true
        // TODO define op
        break
      }

      case "scope": {
        // TODO scope definition
        break
      }

      case "pathParam": {
        // TODO scope's path param
        break
      }

      default: {
        if (node.name.startsWith("/")) {
          // TODO append to paths
          enterScope(node)
        } else {
          throw new Error(JSON.stringify(node))
        }
        break
      }
    }
  }

  return { refs, paths }
}

export const toCore = (doc: kdljs.Document): CoreService => {
  const { info, servers } = topLevel(doc)

  const { refs, paths } = enterScope({
    name: "",
    children: doc,
    values: [],
    tags: { name: "", values: [], properties: {} },
    properties: {},
  })

  return { info, servers, refs, paths }
}
