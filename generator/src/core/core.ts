import { Mime, OptionalBag, RequiredBag, RSchema, SchemaOrRef } from "./RSchema"

export interface ServiceInfo {
  title: string
  version: string
  termsOfService?: string
}

export type CoreMethod = "GET" | "HEAD" | "DELETE" | "POST" | "PUT" | "PATCH"

/**
 * a record containing types
 */
export type CoreTypeRefs = Record<string, RSchema>

export type CoreMimes = Record<Mime, SchemaOrRef>

type StatusCode1 = "1" | "2" | "3" | "4" | "5"
type DigitStr = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type StatusCodeStr = `${StatusCode1}${DigitStr}${DigitStr}`

export const toStatusCode = (code: number): StatusCodeStr =>
  String(code) as StatusCodeStr

export type CoreStatus = {
  headers?: OptionalBag
  cookies?: OptionalBag
  body: CoreMimes
}

export type CoreRes = Partial<Record<StatusCodeStr, CoreStatus>>

export interface CoreReq {
  headers?: OptionalBag
  query?: OptionalBag
  pathParams?: RequiredBag
  cookies?: OptionalBag
  body?: CoreMimes
}

export interface CoreOp {
  name?: string
  description?: string
  req: CoreReq
  res: CoreRes
}

export type URLPath = `/${string}`

export type CorePaths = Record<URLPath, Partial<Record<CoreMethod, CoreOp>>>

export interface CoreServer {
  url: string
}

export interface CoreService {
  info: ServiceInfo
  options?: Record<string, unknown>
  refs: CoreTypeRefs
  paths: CorePaths
  servers?: ReadonlyArray<CoreServer>
}
