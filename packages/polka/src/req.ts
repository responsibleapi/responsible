import type { ErrorObject } from "ajv"
import type { ServerResponse } from "node:http"
import type { oas31 } from "openapi3-ts"
import type { Polka, Request } from "polka"
import type * as Trouter from "trouter"
import { memoize, mkAjv } from "../../http-jsonschema/src/common"
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

function noDuplicates<T>(
  obj: Partial<Record<string, T | T[]>>,
): Readonly<Record<string, T>> {
  const ret = {} as Record<string, T>

  for (const k in obj) {
    const v = obj[k]
    if (!v) continue

    if (Array.isArray(v)) {
      if (v.length) {
        ret[k] = v[0]
      }
    } else {
      ret[k] = v
    }
  }

  return ret
}

interface ParsedCookiesAndBody extends Request {
  cookies: Partial<Record<string, string>>
  body: unknown
}

const inMemReq = (req: ParsedCookiesAndBody): ReqBuf => ({
  params: {
    path: req.params,
    header: noDuplicates(req.headers),
    query: noDuplicates(req.query),
    cookie: req.cookies as Record<string, string>,
  },
  body: {
    mime: req.headers["content-type"] ?? "",
    body: req.body,
  },
})

type Middleware = (
  req: ParsedCookiesAndBody,
  res: ServerResponse,
  next: () => Promise<void>,
) => void | Promise<void>

function validateMiddleware<OpID extends string>(
  doc: oas31.OpenAPIObject,
  ops: Record<OpID, FullOperation>,
  i18nErrors: (res: ServerResponse, errors: ErrorObject[]) => void,
): (openApiPath: string) => Middleware {
  const refs = new JsonResolver(doc)
  const ajv = mkAjv(doc)

  const getReqValidator = memoize((opID: OpID) =>
    ajv.compile<ReqBuf>(requestToSchema(refs, ops[opID])),
  )

  return (
      openApiPath, // for op lookup
    ) =>
    async (req, res, next) => {
      const op = req.method
        ? refs.root.paths?.[openApiPath][req.method.toLowerCase() as HttpMethod]
        : undefined

      if (!op) {
        await next()
        return
      }

      const validate = getReqValidator(op.operationId as OpID)
      validate(inMemReq(req))

      const errors = validate.errors
      if (errors?.length) {
        i18nErrors(res, errors)
        return
      }

      await next()
    }
}

type Handler = (
  req: ParsedCookiesAndBody,
  res: ServerResponse,
) => void | Promise<void>

export function openApiRoutes<OpID extends string, SecScheme extends string>({
  polka,
  doc,
  i18nErrors,
  handlers,
}: {
  polka: Polka
  doc: Readonly<oas31.OpenAPIObject>
  handlers: Readonly<Partial<Record<OpID, Handler>>>
  securityHandlers: Readonly<Record<SecScheme, Middleware>>
  i18nErrors: (res: ServerResponse, errors: ErrorObject[]) => void
}): void {
  if (!doc.paths) return

  const { ops, colonPaths } = operationLookup<OpID>(doc.paths)
  const mkValidator = validateMiddleware(doc, ops, i18nErrors)

  for (const opID in handlers) {
    const handler = handlers[opID]
    if (!handler) continue

    const { method, openApiPath } = ops[opID]

    polka.add(
      method.toUpperCase() as Trouter.HTTPMethod,
      colonPaths[openApiPath],
      mkValidator(openApiPath) as never,
      handler as never,
    )
  }
}
