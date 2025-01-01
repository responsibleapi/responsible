import type { Ajv } from "ajv"
import type { Env, Hono } from "hono"
import type { StatusCode } from "hono/utils/http-status"
import type { oas31 } from "openapi3-ts"
import {
  isObject,
  lowerCaseKeys,
  memoize,
  mkAjv,
} from "../../http-jsonschema/src/common"
import { JsonResolver } from "../../http-jsonschema/src/jsonresolver"
import {
  type FullOperation,
  operationLookup,
} from "../../http-jsonschema/src/operations"
import {
  type ResBuf,
  responsesToSchema,
} from "../../http-jsonschema/src/rescompiler"

type ReqBody = object | FormData | string

interface ReqSchema {
  body?: ReqBody
  headers?: Record<string, string>
  /* path params */
  pathParams?: Record<string, string>
}

function reqBody(body: ReqBody | undefined): [string?, BodyInit?] {
  switch (true) {
    case body instanceof FormData:
      return ["application/x-www-form-urlencoded", body]

    case typeof body === "string":
      return ["text/plain", body]

    case isObject(body):
      return ["application/json", JSON.stringify(body)]

    default:
      return []
  }
}

const withParams = (
  openApiPath: string,
  params: Record<string, string>,
): string =>
  openApiPath
    .split("/")
    .map(part =>
      part.startsWith("{") && part.endsWith("}")
        ? params[part.slice(1, -1)]
        : part,
    )
    .join("/")

function toReq(
  { method, openApiPath }: FullOperation,
  { body: rawBody, headers = {}, pathParams = {} }: ReqSchema = {},
): Request {
  const [ct, body] = reqBody(rawBody)
  if (ct) {
    headers["Content-Type"] = ct
  }

  const base = "http://127.0.0.1"
  return new Request(new URL(withParams(openApiPath, pathParams), base), {
    method,
    body,
    headers,
  })
}

interface Check {
  req?: ReqSchema
  status: StatusCode
}

function resBody(res: Response): Promise<object | FormData | string | Blob> {
  const ct = res.headers.get("Content-Type")

  switch (true) {
    case ct?.includes("json"):
      return res.json()

    case ct?.includes("form"):
      return res.formData()

    case ct?.includes("octet-stream"):
      return res.blob()

    default:
      return res.text()
  }
}

const inMemRes = (res: Response, body: unknown): ResBuf => ({
  status: res.status,
  headers: lowerCaseKeys(Object.fromEntries(res.headers)),
  body: {
    mime: res.headers.get("Content-Type") ?? "",
    body,
  },
})

export class Responsible<OpID extends string, AppEnv extends Env> {
  private readonly ops: Readonly<Record<OpID, FullOperation>>
  private readonly refs: JsonResolver<oas31.OpenAPIObject>
  private readonly ajv: Ajv

  constructor(
    doc: Readonly<oas31.OpenAPIObject>,
    private readonly app: Hono<AppEnv>,
  ) {
    this.ops = operationLookup(doc.paths ?? {}).ops
    this.refs = new JsonResolver(doc)
    this.ajv = mkAjv(doc)
  }

  private getResValidator = memoize((opID: OpID) =>
    this.ajv.compile<ResBuf>(
      responsesToSchema(this.refs, this.ops[opID].responses ?? {}),
    ),
  )

  public async check(opID: OpID, { status, req }: Check): Promise<Response> {
    const op = this.ops[opID]
    const res = await this.app.request(toReq(op, req))

    const body = await resBody(res.clone())

    const memRes = inMemRes(res, body)
    const validate = this.getResValidator(opID)
    validate(memRes)

    if (validate.errors?.length) {
      throw new Error(JSON.stringify({ errors: validate.errors, memRes }))
    }

    if (res.status !== status) {
      throw new Error(
        `Expected status ${String(status)}, got ${String(res.status)}:
        ${JSON.stringify(body, null, 2)}`,
      )
    }

    return res
  }
}
