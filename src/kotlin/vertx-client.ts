import {
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreReq,
  CoreResponses,
  CoreService,
  RefsRec,
  StatusCodeStr,
} from "../core/core"
import { isOptional, Mime, SchemaOrRef } from "../core/endpoint"
import { KotlinType, typeNameKotlin } from "./types"

const VERTX_T = "io.vertx.core.Vertx"
const CLOSEABLE_T = "java.io.Closeable"
const WEBCLIENT_T = "io.vertx.ext.web.client.WebClient"
const WEBCLIENT_OPTIONS_T = "io.vertx.ext.web.client.WebClientOptions"

const capitalize = <T extends string>(s: T): Capitalize<T> =>
  (s ? `${s.charAt(0).toUpperCase()}${s.slice(1)}` : s) as Capitalize<T>

type Path = `/${string}`

const toCamelCase = (p: string): string => p.split("/").map(capitalize).join("")

const toMethodParams = <Refs extends RefsRec>(
  req: CoreReq<Refs>,
  body: { body?: SchemaOrRef<Refs> },
): string =>
  Object.entries({
    ...req.params,
    ...req.query,
    ...req.cookies,
    ...req.headers,
    ...body,
  })
    .map(
      ([k, v]) => `${k}: ${typeNameKotlin(v)}${isOptional(v) ? " = null" : ""}`,
    )
    .join(", ")

const successReturnType = <Refs extends RefsRec>(
  responses: CoreResponses<Refs>,
): KotlinType => {
  const sorted = Object.keys(responses).map(Number).sort()
  if (sorted[0] >= 400) throw new Error(JSON.stringify(sorted))

  const what = responses[String(sorted[0]) as StatusCodeStr]
  const sors = Object.values(what.body)
  if (sors.length === 1) {
    return typeNameKotlin(sors[0])
  } else {
    throw new Error(JSON.stringify(what.body))
  }
}

const methodBody = <Refs extends RefsRec>(
  path: `/${string}`,
  method: CoreMethod,
  op: CoreOp<Refs>,
  mName: string,
  body?: SchemaOrRef<Refs>,
): string => {
  const retType = successReturnType(op.res)

  return `
suspend fun ${mName}(${toMethodParams(op.req, { body })}): ${retType} {
  val res = client.${method.toLowerCase()}("${path}")
    ${Object.keys(op.req.query ?? {})
      .map(k => `.addQueryParam("${k}", ${k})`)
      .join("\n")}
    ${Object.keys(op.req.headers ?? {})
      .map(k => `.addHeader("${k}", ${k})`)
      .join("\n")}
    ${body ? ".sendJson(body)" : ""}
    .await()
  return res
}
`
}

const genReqBodyOp = <Refs extends RefsRec>(
  path: Path,
  method: CoreMethod,
  op: CoreOp<Refs>,
  mime: Mime,
  sor: SchemaOrRef<Refs>,
): string => {
  const bodyMimes = Object.entries(op.req.body ?? {})
  const lowerMethod = method.toLowerCase()

  const mName =
    Object.keys(bodyMimes).length === 1
      ? op.name || `${lowerMethod}${toCamelCase(path)}`
      : op.name
      ? `${op.name}${toCamelCase(mime)}`
      : `${lowerMethod}${toCamelCase(path)}${toCamelCase(mime)}`

  if (!mime.includes("application/json")) {
    throw new Error(`unsupported mime ${mime}`)
  }

  return methodBody(path, method, op, mName, sor)
}

const genOp = <Refs extends RefsRec>(
  path: Path,
  method: CoreMethod,
  op: CoreOp<Refs>,
): string => {
  const bodyMimes = Object.entries(op.req.body ?? {})
  if (bodyMimes.length) {
    return bodyMimes
      .map(([mime, sor]) => genReqBodyOp(path, method, op, mime as Mime, sor))
      .join("\n")
  } else {
    const mName = op.name || `${method.toLowerCase()}${toCamelCase(path)}`
    return methodBody(path, method, op, mName)
  }
}

const toMethods = <Refs extends RefsRec>(paths: CorePaths<Refs>): string =>
  Object.entries(paths)
    .map(([path, methods]) =>
      Object.entries(methods)
        .map(([method, op]) => genOp(path as Path, method as CoreMethod, op))
        .join("\n"),
    )
    .join("\n")

export const genVertxKotlinClient = <Refs extends RefsRec>(
  x: CoreService<Refs>,
): string => {
  const cName = capitalize(x.info.title)

  return `
import io.vertx.kotlin.coroutines.await

class ${cName}Client(vertx: ${VERTX_T}, opts: ${WEBCLIENT_OPTIONS_T}) : ${CLOSEABLE_T} {
  
  val client = ${WEBCLIENT_T}.create(vertx, opts)
  
  ${toMethods(x.paths)}
  
  override fun close(): Unit = client.close()
}
`
}
