import type { Context, Env, MiddlewareHandler } from "hono"
import { HTTPException } from "hono/http-exception"
import type { oas31 } from "openapi3-ts"
import { asyncEvery, asyncSome } from "../../http-jsonschema/src/common"
import type { HttpMethod } from "../../http-jsonschema/src/operations"

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
  <SecScheme extends string>(
    doc: oas31.OpenAPIObject,
    colonToOpenApi: Record<string, string>,
    securityHandlers: Record<SecScheme, MiddlewareHandler>,
  ): MiddlewareHandler =>
  async (ctx, next) => {
    const openApiPath = colonToOpenApi[ctx.req.routePath]
    const op =
      doc.paths?.[openApiPath][ctx.req.method.toLowerCase() as HttpMethod]

    if (!op?.security) {
      await next()
      return
    }

    const ok = await asyncSome(op.security, security =>
      asyncEvery(Object.keys(security), ref =>
        succeeds(securityHandlers[ref as SecScheme], ctx),
      ),
    )

    if (ok) {
      await next()
    } else {
      throw new HTTPException(401, {})
    }
  }
