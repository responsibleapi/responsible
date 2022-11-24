import {
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreReq,
  CoreService,
  CoreTypeRefs,
  toStatusCode,
} from "../core/core"
import {
  isKey,
  isOptional,
  Mime,
  OptionalBag,
  optionalGet,
  schemaGet,
  SchemaOrRef,
} from "../core/schema"
import {
  genKotlinTypes,
  kotlinClassName,
  kotlinTypeName,
  typeGenerics,
} from "./types"
import { capitalize } from "../dsl/kdl/kdl"
import { GenOptions } from "../index"

const VERTX_T = "io.vertx.core.Vertx"
const CLOSEABLE_T = "java.io.Closeable"
const WEBCLIENT_T = "io.vertx.ext.web.client.WebClient"
const WEBCLIENT_OPTIONS_T = "io.vertx.ext.web.client.WebClientOptions"
const RESPONSE_PREDICATE_T =
  "io.vertx.ext.web.client.predicate.ResponsePredicate"

const HTTP_EXCEPTION_T = "HttpException"

const DECLARE_RESILIENT = `
suspend fun <T> resilient(
    attempt: Int = 1,
    f: suspend () -> io.vertx.ext.web.client.HttpResponse<T>,
): io.vertx.ext.web.client.HttpResponse<T> =
    try {
        f()
    } catch (e: Throwable) {
        onError(e)

        if (attempt < 10) {
            kotlinx.coroutines.delay(timeMillis = 1000)
            resilient(attempt = attempt + 1, f = f)
        } else throw e
    }
`

type Path = `/${string}`

const toCamelCase = (p: string): string => p.split("/").map(capitalize).join("")

const toMethodParams = (
  refs: CoreTypeRefs,
  req: CoreReq,
  body: { body?: SchemaOrRef },
): string =>
  Object.entries({
    ...req.pathParams,
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

const isExternal = (
  refs: CoreTypeRefs,
  sor: SchemaOrRef,
): sor is keyof CoreTypeRefs =>
  isKey(refs, sor) && refs[sor].type === "external"

const extractBodyExpr = (
  refs: CoreTypeRefs,
  path: ReadonlyArray<string>,
  mime: Mime,
  sor: SchemaOrRef,
): `res.bodyAs${string}` | "Unit" => {
  if (schemaGet(refs, sor).type === "string") {
    return "res.bodyAsString()"
  }

  if (mime.includes("application/json")) {
    if (isExternal(refs, sor)) {
      return `res.bodyAsJson(${sor}::class.java)`
    } else {
      const cn = kotlinClassName(refs, path, sor)
      // TODO think about `Any` bro
      return cn === "Any" ? "Unit" : `res.bodyAsJson(${cn}::class.java)`
    }
  }

  throw new Error(`unsupported mime ${mime}`)
}

type RenderedGenerics = "" | `<${string}>`

type MethodGenerics = Record<string, "" | "reified">

export const methodGenerics = (
  refs: CoreTypeRefs,
  op: CoreOp,
): MethodGenerics => {
  const statuses = Object.values(op.res)
  const resBodies = statuses.flatMap(x => Object.values(x.body))

  const regularSchemas = [
    ...Object.values(op.req).flatMap(x =>
      Object.values((x as OptionalBag) ?? {}),
    ),
    ...statuses.flatMap(x => [
      ...Object.values(x.headers ?? {}),
      ...Object.values(x.cookies ?? {}),
    ]),
    ...resBodies.filter(x => !isExternal(refs, x)),
  ]

  return Object.fromEntries([
    ...regularSchemas
      .flatMap(x => [...typeGenerics(refs, optionalGet(x))])
      .map(x => [x, ""] as const),

    ...resBodies.flatMap(x =>
      isExternal(refs, x) ? [[x, "reified"] as const] : [],
    ),
  ])
}

const render = (g: MethodGenerics): RenderedGenerics => {
  const es = Object.entries(g)
  if (!es.length) return ""

  return `<${es.map(([k, v]) => (k ? `${v} ${k}` : v)).join(", ")}>`
}

const declareMethod = (
  refs: CoreTypeRefs,
  path: Path,
  method: CoreMethod,
  op: CoreOp,
  mName: string,
  options: GenOptions,
  docPath: ReadonlyArray<string>,
  body?: SchemaOrRef,
): string => {
  const sorted = Object.keys(op.res).map(Number).sort()
  const code = sorted[0]
  if (code >= 400) throw new Error(JSON.stringify(sorted))

  const codeStr = toStatusCode(code)
  const what = op.res[codeStr]
  const schemas = Object.entries(what?.body ?? {})
  if (schemas.length !== 1) {
    throw new Error(JSON.stringify(what?.body))
  }

  const [mime, sor] = schemas[0]

  const tn = kotlinTypeName(refs, docPath, sor)
  const returnType = tn === "Any?" ? "Unit" : tn

  const methodParams = toMethodParams(refs, op.req, { body })

  const mg = methodGenerics(refs, op)
  const inline = Object.values(mg).find(x => x === "reified") ? "inline" : ""

  const addHeaders = Object.keys(op.req.headers ?? {})
    .map(k => `.addHeader("${k}", ${k})`)
    .join("\n")

  const addQueryParams = Object.keys(op.req.query ?? {})
    .map(k => `.addQueryParam("${k}", ${k})`)
    .join("\n")

  const returnExpr = extractBodyExpr(refs, docPath, mime as Mime, sor)

  const resilient = options.resilient ? "resilient" : "run"

  return `
suspend ${inline} fun ${render(mg)} ${mName}(${methodParams}): ${returnType} {
  val path = "${path}"
  val res = ${resilient} {
    client.${method.toLowerCase()}(path)
      .expect(predicate)
      ${addHeaders}
      ${addQueryParams}
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
      else -> error("${method} $path response did not declare $status")
    }
    throw ${HTTP_EXCEPTION_T}(path, status, resBody)
  }
}
`
}

const genReqBodyOp = (
  refs: CoreTypeRefs,
  path: Path,
  method: CoreMethod,
  op: CoreOp,
  mime: Mime,
  sor: SchemaOrRef,
  options: GenOptions,
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

  return declareMethod(refs, path, method, op, mName, options, sor)
}

const genOp = (
  refs: CoreTypeRefs,
  path: Path,
  method: CoreMethod,
  op: CoreOp,
  options: GenOptions,
): string => {
  const bodyMimes = Object.entries(op.req.body ?? {})
  if (bodyMimes.length) {
    return bodyMimes
      .map(([mime, sor]) =>
        genReqBodyOp(refs, path, method, op, mime as Mime, sor, options),
      )
      .join("\n")
  } else {
    const mName = op.name || `${method.toLowerCase()}${toCamelCase(path)}`
    return declareMethod(refs, path, method, op, mName, options)
  }
}

const toMethods = (
  refs: CoreTypeRefs,
  paths: CorePaths,
  options: GenOptions,
): string =>
  Object.entries(paths)
    .map(([path, methods]) =>
      Object.entries(methods)
        .flatMap(([method, op]) =>
          op
            ? [genOp(refs, path as Path, method as CoreMethod, op, options)]
            : [],
        )
        .join("\n"),
    )
    .join("\n")

export const genVertxKotlinClient = (
  svc: CoreService,
  opts: GenOptions,
): string => {
  const { info, paths, refs } = svc
  const cName = capitalize(info.title)

  return `  
${opts?.packageName ? `package ${String(opts.packageName)}` : ""}
  
import io.vertx.kotlin.coroutines.await

${genKotlinTypes(svc)}

class ${cName}Client(
  vertx: ${VERTX_T},
  opts: ${WEBCLIENT_OPTIONS_T},
  ${opts.resilient ? "val onError: (e: Throwable) -> Unit," : ""}
) : ${CLOSEABLE_T} {

  class ${HTTP_EXCEPTION_T}(val path: String, val statusCode: Int, val body: Any?) : Exception()

  ${opts.resilient ? DECLARE_RESILIENT : ""}
  
  val client: ${WEBCLIENT_T} = ${WEBCLIENT_T}.create(vertx, opts)
  
  val predicate: ${RESPONSE_PREDICATE_T} = ${RESPONSE_PREDICATE_T}.status(100, 500)
  
  ${toMethods(refs, paths, opts)}
  
  override fun close(): Unit = client.close()
}
`
}
