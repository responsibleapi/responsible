import {
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreReq,
  CoreService,
  CoreTypeRefs,
  StatusCodeStr,
} from "../core/core"
import { genKotlinTypes, kotlinClassName, kotlinTypeName } from "./types"
import { isKey, isOptional, Mime, SchemaOrRef } from "../core/endpoint"

const VERTX_T = "io.vertx.core.Vertx"
const CLOSEABLE_T = "java.io.Closeable"
const WEBCLIENT_T = "io.vertx.ext.web.client.WebClient"
const WEBCLIENT_OPTIONS_T = "io.vertx.ext.web.client.WebClientOptions"

const HTTP_EXCEPTION_T = "HttpException"
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

const toMethodParams = <Refs extends CoreTypeRefs>(
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

const isExternal = <Refs extends CoreTypeRefs>(
  refs: Refs,
  sor: SchemaOrRef<Refs>,
): sor is keyof Refs => isKey(refs, sor) && refs[sor].type === "external"

const extractBodyExpr = <Refs extends CoreTypeRefs>(
  refs: Refs,
  mime: Mime,
  sor: SchemaOrRef<Refs>,
): "Unit" | `res.body${string}` => {
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

const classGenerics = <Refs extends CoreTypeRefs>(
  refs: Refs,
): ReadonlyArray<keyof Refs> =>
  Object.entries(refs).flatMap(([k, v]) => (v.type === "external" ? [k] : []))

const methodGenerics = <Refs extends CoreTypeRefs>(
  refs: Refs,
  op: CoreOp<Refs>,
): Generics => {
  throw new Error("not implemented")
}

/**
 * TODO method generics + inline + reified
 */
const declareMethod = <Refs extends CoreTypeRefs>(
  refs: Refs,
  path: Path,
  method: CoreMethod,
  op: CoreOp<Refs>,
  mName: string,
  body?: SchemaOrRef<Refs>,
): string => {
  const sorted = Object.keys(op.res).map(Number).sort()
  const code = sorted[0]
  if (code >= 400) throw new Error(JSON.stringify(sorted))

  const codeStr = String(code) as StatusCodeStr
  const what = op.res[codeStr]
  const schemas = Object.entries(what.body ?? {})
  if (schemas.length !== 1) {
    throw new Error(JSON.stringify(what.body))
  }

  const [mime, sor] = schemas[0]

  const tn = kotlinTypeName(refs, sor)
  const returnType = tn === "Any?" ? "Unit" : tn

  const returnExpr = extractBodyExpr(refs, mime as Mime, sor)

  const methodParams = toMethodParams(refs, op.req, { body })

  const methodGenerics1 = methodGenerics(refs, op)

  return `
suspend fun ${methodGenerics1} ${mName}(${methodParams}): ${returnType} {
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
  if (status == ${code}) {
    return ${returnExpr}
  } else {
   val resBody =  when (status) {
      ${Object.entries(op.res)
        .filter(([cde, _]) => Number(cde) !== code)
        .map(([cde, resp]) => {
          if (resp.body) {
            const [mme, sro] = Object.entries(resp.body)[0]
            return `${cde} -> ${extractBodyExpr(refs, mme as Mime, sro)}`
          } else {
            return `${cde} -> null`
          }
        })
        .join("\n")}
      else -> throw ${UNEXPECTED_STATUS_T}(path, status)
    }
    throw ${HTTP_EXCEPTION_T}(path, status, resBody)
  }
}
`
}

const genReqBodyOp = <Refs extends CoreTypeRefs>(
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

  return declareMethod(refs, path, method, op, mName, sor)
}

const genOp = <Refs extends CoreTypeRefs>(
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
    return declareMethod(refs, path, method, op, mName)
  }
}

const toMethods = <Refs extends CoreTypeRefs>(
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

type Generics = "" | `<${string}>`

const externalClassField = <Refs extends CoreTypeRefs>(
  k: keyof Refs,
): `${string}Class` => `${String(k)}Class`

export const genVertxKotlinClient = <Refs extends CoreTypeRefs>(
  { info, paths, refs }: CoreService<Refs>,
  { packageName }: { packageName: string },
): string => {
  const cName = capitalize(info.title)

  return `  
package ${packageName}
  
import io.vertx.kotlin.coroutines.await

${genKotlinTypes(refs)}

class ${HTTP_EXCEPTION_T}(val path: String, val statusCode: Int, val body: Any?) : Exception()

class ${UNEXPECTED_STATUS_T}(val path: String, val statusCode: Int): Exception()

${DECLARE_RESILIENT}

class ${cName}Client(
  vertx: ${VERTX_T},
  opts: ${WEBCLIENT_OPTIONS_T},
) : ${CLOSEABLE_T} {
  
  private val client = ${WEBCLIENT_T}.create(vertx, opts)
  
  ${toMethods(refs, paths)}
  
  override fun close(): Unit = client.close()
}
`
}
