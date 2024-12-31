import type { ErrorObject } from "ajv"
import {
  type Context,
  type Env,
  type Handler,
  Hono,
  type HonoRequest,
  type MiddlewareHandler,
} from "hono"
import { getCookie } from "hono/cookie"
import type { oas31 } from "openapi3-ts"
import { lowerCaseKeys, memoize, mkAjv } from "../../http-jsonschema/src/common"
import { JsonResolver } from "../../http-jsonschema/src/jsonresolver"
import {
  type FullOperation,
  type HttpMethod,
  operationLookup,
} from "../../http-jsonschema/src/operations"
import {
  type ReqBuf,
  requestToSchema,
} from "../../http-jsonschema/src/reqcompiler"
import { securityMiddleware } from "./security"

function getBody(req: HonoRequest): Promise<unknown> {
  const ct = req.header("Content-Type")
  if (!ct) return Promise.resolve(undefined)

  switch (true) {
    case ct.includes("json"):
      return req.json()

    case ct.includes("form"):
      return req.formData()

    case ct.includes("text"):
      return req.text()

    default:
      return req.blob()
  }
}

const inMemReq = (ctx: Context, body: unknown): ReqBuf => ({
  params: {
    path: ctx.req.param(),
    header: lowerCaseKeys(ctx.req.header()),
    query: ctx.req.query(),
    cookie: getCookie(ctx),
  },
  body: {
    mime: ctx.req.header("Content-Type") ?? "",
    body,
  },
})

function getOp(
  doc: oas31.OpenAPIObject,
  openApiPaths: Record<string, string>,
  req: HonoRequest,
): oas31.OperationObject | undefined {
  const openApiPath = openApiPaths[req.routePath]
  const method = req.method.toLowerCase() as HttpMethod
  return doc.paths?.[openApiPath][method]
}

function validateMiddleware<OpID extends string>({
  doc,
  openApiPaths,
  ops,
  onErrors,
}: {
  doc: oas31.OpenAPIObject
  openApiPaths: Record<string, string>
  ops: Record<OpID, FullOperation>
  onErrors: (ctx: Context, errors: ErrorObject[]) => Response
}): MiddlewareHandler {
  const refs = new JsonResolver(doc)
  const ajv = mkAjv(doc)

  const getReqValidator = memoize((opID: OpID) =>
    ajv.compile<ReqBuf>(requestToSchema(refs, ops[opID])),
  )

  return async (ctx, next) => {
    const op = getOp(refs.root, openApiPaths, ctx.req)
    if (!op) {
      await next()
      return
    }

    const body = await getBody(ctx.req)

    const validate = getReqValidator(op.operationId as OpID)
    validate(inMemReq(ctx, body))
    const errors = validate.errors

    if (errors?.length) {
      return onErrors(ctx, errors)
    }

    await next()
  }
}

export function openApiRouter<
  OpID extends string,
  SecScheme extends string,
  AppEnv extends Env,
>({
  doc,
  handlers,
  securityHandlers,
  onErrors,
}: {
  doc: Readonly<oas31.OpenAPIObject>
  handlers: Readonly<Partial<Record<OpID, Handler<AppEnv>>>>
  securityHandlers: Readonly<Record<SecScheme, MiddlewareHandler<AppEnv>>>
  onErrors: (ctx: Context, errors: ErrorObject[]) => Response
}): Hono<AppEnv> {
  const hono = new Hono<AppEnv>({})
  if (!doc.paths) return hono

  const { ops, openApiPaths, colonPaths } = operationLookup<OpID>(doc.paths)
  const validate = validateMiddleware({ doc, openApiPaths, ops, onErrors })
  const checkSecurity = securityMiddleware(doc, openApiPaths, securityHandlers)

  for (const opID in handlers) {
    const handler = handlers[opID]
    if (!handler) continue

    const { method, openApiPath } = ops[opID]

    // https://github.com/honojs/hono/issues/2126#issuecomment-1925242220
    hono.on(method, colonPaths[openApiPath], validate, checkSecurity, handler)
  }

  return hono
}
