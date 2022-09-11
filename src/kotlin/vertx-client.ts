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
import { genKotlinTypes, kotlinClassName, kotlinTypeName } from "./types"
import { isKey, isOptional, Mime, SchemaOrRef } from "../core/endpoint"

const VERTX_T = "io.vertx.core.Vertx"
const CLOSEABLE_T = "java.io.Closeable"
const WEBCLIENT_T = "io.vertx.ext.web.client.WebClient"
const WEBCLIENT_OPTIONS_T = "io.vertx.ext.web.client.WebClientOptions"

/**
 * TODO pass the path
 */
const HTTP_EXCEPTION_T = "HttpException"

/**
 * TODO pass the path
 */
const UNEXPECTED_STATUS_T = "UndeclaredStatusException"

const DECLARE_RESILIENT = `
private suspend fun <T> resilient(
    attempt: Int = 1,
    f: suspend () -> io.vertx.ext.web.client.HttpResponse<T>,
): io.vertx.ext.web.client.HttpResponse<T> =
    try {
        f()
    } catch (e: Exception) {
        if (attempt < 20) {
            kotlinx.coroutines.delay(timeMillis = 1000)
            resilient(attempt = attempt + 1, f = f)
        } else throw e
    }
`

const capitalize = <T extends string>(s: T): Capitalize<T> =>
  (s ? `${s.charAt(0).toUpperCase()}${s.slice(1)}` : s) as Capitalize<T>

type Path = `/${string}`

const toCamelCase = (p: string): string => p.split("/").map(capitalize).join("")

const toMethodParams = <Refs extends RefsRec>(
  refs: Refs,
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
      ([k, v]) =>
        `${k}: ${kotlinTypeName(refs, v)}${isOptional(v) ? " = null" : ""}`,
    )
    .join(", ")

const successReturn = <Refs extends RefsRec>(
  responses: CoreResponses<Refs>,
): {
  code: number
  mime: Mime
  sor: SchemaOrRef<Refs>
} => {
  const sorted = Object.keys(responses).map(Number).sort()
  const code = sorted[0]
  if (code >= 400) throw new Error(JSON.stringify(sorted))

  const codeStr = String(code) as StatusCodeStr
  const what = responses[codeStr]
  const schemas = Object.entries(what.body)
  if (schemas.length === 1) {
    const [mime, sor] = schemas[0]
    return { code, sor, mime: mime as Mime }
  } else {
    throw new Error(JSON.stringify(what.body))
  }
}

const isExternal = <Refs extends RefsRec>(
  refs: Refs,
  sor: SchemaOrRef<Refs>,
): sor is keyof Refs => isKey(refs, sor) && refs[sor].type === "external"

const extractBodyExpr = <Refs extends RefsRec>(
  refs: Refs,
  mime: Mime,
  sor: SchemaOrRef<Refs>,
) => {
  if (mime.includes("application/json")) {
    if (isExternal(refs, sor)) {
      return `res.bodyAsJson(${externalClassField(sor)})`
    } else {
      const cn = kotlinClassName(sor)
      return cn === "Any" ? "Unit" : `res.bodyAsJson(${cn}::class.java)`
    }
  } else if (mime.includes("text/plain")) {
    return "res.bodyAsString()"
  }

  throw new Error(`unsupported mime ${mime}`)
}

/**
 * TODO method generics + inline + reified
 */
const genMethod = <Refs extends RefsRec>(
  refs: Refs,
  path: Path,
  method: CoreMethod,
  op: CoreOp<Refs>,
  mName: string,
  body?: SchemaOrRef<Refs>,
): string => {
  const success = successReturn(op.res)

  const tn = kotlinTypeName(refs, success.sor)
  const returnType = tn === "Any?" ? "Unit" : tn

  const returnExpr = extractBodyExpr(refs, success.mime, success.sor)

  return `
suspend fun ${mName}(${toMethodParams(refs, op.req, { body })}): ${returnType} {
  val path = "${path}"
  val res = resilient {
    client.${method.toLowerCase()}(path)
      .expect(io.vertx.ext.web.client.predicate.ResponsePredicate.status(100, 500))
      ${Object.keys(op.req.query ?? {})
        .map(k => `.addQueryParam("${k}", ${k})`)
        .join("\n")}
      ${Object.keys(op.req.headers ?? {})
        .map(k => `.addHeader("${k}", ${k})`)
        .join("\n")}
      ${body ? ".sendJson(body)" : ""}
      .await()
  }
    
  val status = res.statusCode()
  if (status == ${success.code}) {
    return ${returnExpr}
  } else {
   val resBody =  when (status) {
      ${Object.entries(op.res)
        .filter(([code, _]) => Number(code) !== success.code)
        .map(([code, resp]) => {
          const [mime, sor] = Object.entries(resp.body)[0]
          return `${code} -> ${extractBodyExpr(refs, mime as Mime, sor)}`
        })
        .join("\n")}
      else -> throw ${UNEXPECTED_STATUS_T}(path, status)
    }
    throw ${HTTP_EXCEPTION_T}(path, status, resBody)
  }
}
`
}

const genReqBodyOp = <Refs extends RefsRec>(
  refs: Refs,
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

  return genMethod(refs, path, method, op, mName, sor)
}

const genOp = <Refs extends RefsRec>(
  refs: Refs,
  path: Path,
  method: CoreMethod,
  op: CoreOp<Refs>,
): string => {
  const bodyMimes = Object.entries(op.req.body ?? {})
  if (bodyMimes.length) {
    return bodyMimes
      .map(([mime, sor]) =>
        genReqBodyOp(refs, path, method, op, mime as Mime, sor),
      )
      .join("\n")
  } else {
    const mName = op.name || `${method.toLowerCase()}${toCamelCase(path)}`
    return genMethod(refs, path, method, op, mName)
  }
}

const toMethods = <Refs extends RefsRec>(
  refs: Refs,
  paths: CorePaths<Refs>,
): string =>
  Object.entries(paths)
    .map(([path, methods]) =>
      Object.entries(methods)
        .map(([method, op]) =>
          genOp(refs, path as Path, method as CoreMethod, op),
        )
        .join("\n"),
    )
    .join("\n")

const externalRefNames = <Refs extends RefsRec>(
  refs: Refs,
): ReadonlyArray<keyof Refs> =>
  Object.entries(refs).flatMap(([k, v]) => (v.type === "external" ? [k] : []))

/**
 * TODO move to method generics
 */
const classGenerics = <Refs extends RefsRec>(
  es: ReadonlyArray<keyof Refs>,
): "" | `<${string}>` => (es.length ? `<${es.join(", ")}>` : "")

const externalClassField = <Refs extends RefsRec>(
  k: keyof Refs,
): `${string}Class` => `${String(k)}Class`

export const genVertxKotlinClient = <Refs extends RefsRec>(
  { info, paths, refs }: CoreService<Refs>,
  { packageName }: { packageName: string },
): string => {
  const cName = capitalize(info.title)
  const externals = externalRefNames(refs)

  return `  
package ${packageName}
  
import io.vertx.kotlin.coroutines.await

${genKotlinTypes(refs)}

class ${HTTP_EXCEPTION_T}(val path: String, val statusCode: Int, val body: Any?) : Exception()

class ${UNEXPECTED_STATUS_T}(val path: String, val statusCode: Int): Exception()

${DECLARE_RESILIENT}

class ${cName}Client${classGenerics(externals)}(
  vertx: ${VERTX_T},
  opts: ${WEBCLIENT_OPTIONS_T},
  ${externals
    .map(k => `private val ${externalClassField(k)}: Class<${String(k)}>`)
    .join(",\n")}
) : ${CLOSEABLE_T} {
  
  private val client = ${WEBCLIENT_T}.create(vertx, opts)
  
  ${toMethods(refs, paths)}
  
  override fun close(): Unit = client.close()
}
`
}
