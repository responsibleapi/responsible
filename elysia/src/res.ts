import type { Elysia, Handler, RouteSchema } from "elysia"
import ChowChow, { ChowError } from "oas3-chow-chow"
import type { OpenAPIV3 } from "openapi-types"
import { collectOps, type FullOperation } from "./operations"

interface StringHeaders extends RouteSchema {
  headers?: Record<string, string>
}

interface Req<RS extends StringHeaders> {
  body?: RS["body"]
  headers?: RS["headers"]
}

function toReq<RS extends StringHeaders>(
  op: FullOperation,
  { body, headers = {} }: Req<RS> = {},
): Request {
  if (body && typeof body === "object") {
    headers["content-type"] = "application/json"
  }

  const base = "http://localhost"
  return new Request(new URL(op.path, base), {
    method: op.method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  })
}

interface Check<RS extends StringHeaders> {
  req?: Req<RS>
  status: number
}

type RSchema<Type> = Type extends Handler<infer X> ? X : never

type Handlerz<HS> = {
  [OpID in keyof HS]: HS[OpID] extends Handler<infer RS extends StringHeaders>
    ? Handler<RS>
    : never
}

export class Responsible<HS extends Handlerz<HS>> {
  private readonly app: Elysia
  private readonly ops: Record<keyof HS, FullOperation>
  private readonly cc: Promise<ChowChow>

  constructor(doc: OpenAPIV3.Document, app: Elysia) {
    this.app = app
    this.cc = ChowChow.create(doc, {})
    this.ops = collectOps(doc.paths) as never
  }

  public async check<OpID extends keyof HS>(
    opID: OpID,
    { status, req }: Check<RSchema<HS[OpID]>>,
  ): Promise<Response> {
    const res = await this.app.handle(toReq(this.ops[opID], req))

    const clone = res.clone()
    const cc = await this.cc
    try {
      cc.validateResponseByOperationId(opID as string, {
        status: res.status,
        header: res.headers,
        body: res.headers.get("content-type")?.includes("json")
          ? await clone.json()
          : await clone.text(),
      })
    } catch (e) {
      if (e instanceof ChowError) {
        throw new Error(JSON.stringify(e.toJSON()))
      } else {
        throw e
      }
    }

    if (res.status !== status) {
      throw new Error(`Expected status ${status}, got ${res.status}`)
    }

    return res
  }
}
