import { Elysia, type Context, type Handler } from "elysia"
import type * as ChowChow from "oas3-chow-chow"
import type { OpenAPIV3 } from "openapi-types"
import { collectOps, openApiToColon } from "./operations"

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const TheChowChow = require("oas3-chow-chow")

/* TODO test */
function validate(
  cc: ChowChow.default,
  { path, request, body, cookie, headers, query, error, params }: Context,
) {
  try {
    cc.validateRequestByPath(path, request.method, {
      path: params,
      body,
      cookie: Object.fromEntries(
        Object.entries(cookie).map(([k, v]) => [k, v.value]),
      ),
      header: headers,
      query: query,
    })
  } catch (e) {
    if (e instanceof TheChowChow.ChowError) {
      const json = (e as ChowChow.ChowError).toJSON()
      return error(json.code, json)
    } else {
      throw e
    }
  }
}

function secure(s: OpenAPIV3.SecuritySchemeObject, ctx: Context) {
  if (s.type === "apiKey" && s.in === "header") {
    const v = ctx.headers[s.name]
    if (!v) return ctx.error(401, `missing ${s.name} header`)
  }

  if (s.type === "apiKey" && s.in === "cookie") {
    const v = ctx.cookie[s.name].value
    if (!v) return ctx.error(401, `missing ${s.name} cookie`)
  }
}

function secure2(
  doc: OpenAPIV3.Document,
  ctx: Context,
  securityHandlers: Record<string, Handler>,
) {
  const op = doc.paths[ctx.path]?.[ctx.request.method as OpenAPIV3.HttpMethods]
  if (!op?.security) return

  for (const req of op.security) {
    for (const ref in req) {
      const s = doc.components?.securitySchemes?.[ref]
      if (!s) throw new Error(`missing security scheme ${ref}`)

      securityHandlers[ref](ctx)
    }
  }
}

export async function openAPIRouter({
  doc,
  handlers,
}: {
  doc: OpenAPIV3.Document
  securityHandlers?: Record<string, Handler>
  handlers: Record<string, Handler>
}): Promise<Elysia> {
  const cc: ChowChow.default = await TheChowChow.default.create(doc, {})

  const ops = collectOps(doc.paths)

  const router = new Elysia().onBeforeHandle({ as: "scoped" }, ctx =>
    validate(cc, ctx),
  )

  for (const operationID in handlers) {
    const { method, path } = ops[operationID]
    router.route(method, openApiToColon(path), handlers[operationID])
  }

  return router
}
