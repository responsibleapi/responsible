import { getString, Mime, parseHeader, StatusCodeStr } from "./kdl"
import { parseBody, replaceStars } from "./operation"
import { parseSchemaOrRef, typeName } from "./schema"
import { myDeepmerge } from "./typescript"
import { OpenAPIV3 } from "openapi-types"
import { HasMime } from "./scope"
import { kdljs } from "kdljs"

const parseStatus = (n: kdljs.Node, throwOnDefault: boolean): ScopeRes => {
  if (n.values.length) {
    const mime = n.values.length === 1 ? "*" : (getString(n, 0) as Mime)

    return {
      description: n.name,
      content:
        typeName(n) === "unknown"
          ? undefined
          : { [mime]: { schema: parseSchemaOrRef(n) } },
    }
  }

  if (!n.children.length) throw new Error(JSON.stringify(n))

  let mime: Mime | undefined

  const headers: NonNullable<OpenAPIV3.ResponseObject["headers"]> = {}
  const content: NonNullable<OpenAPIV3.ResponseObject["content"]> = {}

  for (const c of n.children) {
    switch (c.name) {
      case "mime": {
        mime = getString(c, 0) as Mime
        break
      }

      case "header": {
        headers[getString(c, 0).toLowerCase()] = parseHeader(c)
        break
      }

      case "headers": {
        for (const header of c.children) {
          headers[header.name.toLowerCase()] = parseHeader(header)
        }
        break
      }

      case "body": {
        if (mime) throw new Error(JSON.stringify(c))

        const [mame, schema] = parseBody(c)
        content[mame] = { schema }
        break
      }

      case "cookie": {
        const cookieName = getString(c, 0)
        headers["Set-Cookie".toLowerCase()] = {
          required: true,
          schema: {
            type: "string",
            pattern: `${cookieName}=[^;]+`,
          },
        }
        break
      }

      default: {
        if (throwOnDefault) {
          throw new Error(JSON.stringify(c))
        }
      }
    }
  }

  return { description: n.name, headers, content, mime }
}

/**
 * has status: "*"
 * has status: "xxx..yyy"
 * has mime: "*"
 */
export const parseScopeRes = (node: kdljs.Node): ScopeResponses => {
  const ret: ScopeResponses = { ["*"]: parseStatus(node, false) }

  for (const c of node.children) {
    switch (true) {
      case Boolean(+c.name): {
        ret[c.name as StatusCodeStr] = parseStatus(c, true)
        break
      }

      case c.name.includes(".."): {
        const split = c.name.split("..")
        if (split.length !== 2) {
          throw new Error(JSON.stringify(c))
        }

        const [start, end] = split.map(Number)
        if (!(start && end)) {
          throw new Error(JSON.stringify(c))
        }

        ret[`${start}..${end}`] = parseStatus(c, true)
        break
      }

      case c.name === "*": {
        ret["*"] = parseStatus(c, true)
        break
      }
    }
  }

  return ret
}

type WildcardStatus = "*" | `${string}..${string}`

const matches = (k: ScopeStatus, status: number): boolean => {
  if (!status) throw new Error(String(status))

  if (k === "*") return true

  if (k.includes("..")) {
    const [min, max] = k.split("..").map(Number)
    return status >= min && status <= max
  }

  return Number(k) === status
}

/**
 * has mime: "*"
 */
const matchingReses = (
  scope: ScopeResponses,
  status: number,
): ReadonlyArray<ScopeRes> => {
  if (!status) throw new Error(String(status))

  return Object.entries(scope).flatMap(([k, v]) =>
    v && matches(k as WildcardStatus, status) ? [v] : [],
  )
}

export type ScopeStatus = StatusCodeStr | "*" | `${string}..${string}`

type ScopeRes = OpenAPIV3.ResponseObject & HasMime

export type ScopeResponses = Partial<Record<ScopeStatus, ScopeRes>>

const throwKey = (o: Record<string, unknown>) => {
  if (!Object.keys(o).every(Number)) {
    throw new Error(JSON.stringify(o))
  }
}

/**
 * 0. add statuses from the scope
 * 1. add empty responses for operation statuses
 * 2. apply scope to the responses
 * 3. add real responses for the operation
 */
export const parseCoreRes = (
  scope: ScopeResponses,
  res: kdljs.Node,
): OpenAPIV3.ResponsesObject => {
  // get statuses from the scope
  const scopeStatuses = Object.fromEntries(
    Object.entries(scope).flatMap(([k, v]) => (v && Number(k) ? [[k, v]] : [])),
  )
  throwKey(scopeStatuses)

  // get empty responses for operation statuses
  const emptyOpStatuses = Object.fromEntries(
    res.children.map(c => {
      if (!Number(c.name)) throw new Error(JSON.stringify(c))

      return [c.name, {} as ScopeRes]
    }),
  )
  throwKey(emptyOpStatuses)

  // apply scope to the responses
  const allMerged = Object.fromEntries(
    Object.entries(myDeepmerge(scopeStatuses, emptyOpStatuses)).flatMap(
      ([k, v]) => {
        if (!v) return []
        const status = Number(k)
        if (!status) throw new Error(k)

        return [
          [k, myDeepmerge(...matchingReses(scope, status), v) as ScopeRes],
        ]
      },
    ),
  )
  throwKey(allMerged)

  // get real responses
  const real = Object.fromEntries(
    res.children.map(c => {
      if (!Number(c.name)) throw new Error(JSON.stringify(c))

      return [c.name, parseStatus(c, true)]
    }),
  )
  throwKey(real)

  const all = myDeepmerge(allMerged, real)
  throwKey(all)

  return Object.fromEntries(
    Object.entries(all).flatMap(([k, v]) => {
      if (!v) return []

      const status = Number(k)
      if (!status) throw new Error(k)

      const mime = matchingReses(scope, status).find(x => x.mime)?.mime

      const copy: ScopeRes = {
        ...v,
        content: replaceStars(v.content, mime),
        mime: undefined,
      }

      return [[k, copy]]
    }),
  )
}
