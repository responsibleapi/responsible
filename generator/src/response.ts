import { parseBody, replaceStars } from "./operation"
import type { Mime, StatusCodeStr } from "./kdl"
import { isEmpty, noUndef } from "./typescript"
import type { OpenAPIV3 } from "openapi-types"
import { getString, parseHeader } from "./kdl"
import { deepmerge } from "deepmerge-ts"
import type { HasMime } from "./scope"
import { typeName } from "./schema"
import type { kdljs } from "kdljs"

const parseStatus = (n: kdljs.Node, throwOnDefault: boolean): ScopeRes => {
  if (n.values.length) {
    const [mime, schema] = parseBody(n)

    return noUndef({
      description: n.name,
      content: typeName(n) === "unknown" ? undefined : { [mime]: { schema } },
    })
  }

  if (!n.children.length) throw new Error(JSON.stringify(n))

  let mime: Mime | undefined

  let description: string | undefined
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

      case "description": {
        description = getString(c, 0)
        break
      }

      default: {
        if (throwOnDefault) {
          throw new Error(JSON.stringify(c))
        }
      }
    }
  }

  return noUndef({
    description: description || n.name,
    headers: isEmpty(headers) ? undefined : headers,
    content: isEmpty(content) ? undefined : content,
    mime,
  })
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
      case Boolean(Number(c.name)): {
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

/**
 * 0. add statuses from the scope
 * 1. add empty responses for operation statuses
 * 2. apply scope to the responses
 * 3. add real responses for the operation
 */
export const parseCoreRes = (
  scope: ScopeResponses,
  node: kdljs.Node,
): OpenAPIV3.ResponsesObject => {
  // get statuses from the scope
  const scopeStatuses = Object.fromEntries(
    Object.entries(scope).flatMap(([k, v]) => (v && Number(k) ? [[k, v]] : [])),
  )

  // get empty responses for operation statuses
  const emptyOpStatuses = Object.fromEntries(
    node.children.map(c => {
      if (!Number(c.name)) throw new Error(JSON.stringify(c))

      return [c.name, {} as ScopeRes]
    }),
  )

  // apply scope to the responses
  const allMerged = Object.fromEntries(
    Object.entries(deepmerge(scopeStatuses, emptyOpStatuses)).flatMap(
      ([k, v]) => {
        if (!v) return []

        const status = Number(k)
        if (!status) throw new Error(k)

        return [[k, deepmerge(...matchingReses(scope, status), v) as ScopeRes]]
      },
    ),
  )

  // get real responses
  const real = Object.fromEntries(
    node.children.map(c => {
      if (!Number(c.name)) throw new Error(JSON.stringify(c))

      return [c.name, parseStatus(c, true)]
    }),
  )

  return Object.fromEntries(
    Object.entries(deepmerge(allMerged, real)).flatMap(([k, v]) => {
      if (!v) return []

      const status = Number(k)
      if (!status) throw new Error(k)

      const mime = matchingReses(scope, status).find(x => x.mime)?.mime

      const ret: ScopeRes = noUndef({
        ...v,
        content: replaceStars(v.content, mime),
        mime: undefined,
      })

      return [[k, ret]]
    }),
  )
}
