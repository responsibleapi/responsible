import {
  Mime,
  OptionalBag,
  RequiredBag,
  RSchema,
  SchemaOrRef,
} from "./endpoint"

export interface ServiceInfo {
  title: string
  version: string
}

export type CoreMethod = "GET" | "HEAD" | "DELETE" | "POST" | "PUT" | "PATCH"

/**
 * a record containing types
 */
export type CoreTypeRefs = Record<string, RSchema>

export type CoreMimes = {
  type: "mimes"
  [k: Mime]: SchemaOrRef
}

export interface CoreRes {
  headers?: OptionalBag
  body?: CoreMimes
}

type StatusCode1 = "1" | "2" | "3" | "4" | "5"
type DigitStr = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type StatusCodeStr = `${StatusCode1}${DigitStr}${DigitStr}`

export type CoreResponses = Record<StatusCodeStr, CoreRes>

export interface CoreReq {
  headers?: OptionalBag
  query?: OptionalBag
  params?: RequiredBag
  cookies?: OptionalBag
  body?: CoreMimes
}

export interface CoreOp {
  name?: string
  req: CoreReq
  res: CoreResponses
}

export type CorePaths = Record<`/${string}`, Record<CoreMethod, CoreOp>>

export interface CoreServer {
  url: string
}

export interface CoreService {
  info: ServiceInfo
  refs: CoreTypeRefs
  paths: CorePaths
  servers: ReadonlyArray<CoreServer>
}
