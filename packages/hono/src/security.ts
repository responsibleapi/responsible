import type { Context, Env, MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import { routePath } from "hono/route"
import type { oas31 } from "openapi3-ts"
import { asyncEvery, asyncSome } from "../../http-jsonschema/src/common"
import { isHttpMethod } from "../../http-jsonschema/src/operations"

async function succeeds<E extends Env, P extends string>(
  handler: MiddlewareHandler<E, P>,
  ctx: Context<E, P>,
): Promise<boolean> {
  try {
    let nextCalled = false
    await handler(ctx, () => {
      nextCalled = true
      return Promise.resolve()
    })
    return nextCalled
  } catch {
    return false
  }
}

export const securityMiddleware =
  (
    doc: oas31.OpenAPIObject,
    colonToOpenApi: Record<string, string>,
    securityHandlers: Readonly<Partial<Record<string, MiddlewareHandler>>>,
  ): MiddlewareHandler =>
  async (ctx, next) => {
    const openApiPath = colonToOpenApi[routePath(ctx)]
    const method = ctx.req.method.toLowerCase()
    const op = isHttpMethod(method)
      ? doc.paths?.[openApiPath]?.[method]
      : undefined

    if (!op?.security) {
      await next()
      return
    }

    const ok = await asyncSome(op.security, security =>
      asyncEvery(Object.keys(security), ref => {
        const handler = securityHandlers[ref]
        return handler ? succeeds(handler, ctx) : Promise.resolve(false)
      }),
    )

    if (ok) {
      await next()
    } else {
      throw new HTTPException(401, {})
    }
  }
