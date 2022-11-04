import {
  Mime,
  OptionalBag,
  RequiredBag,
  RSchema,
  SchemaOrRef,
} from "./endpoint"

export interface ServiceInfo {
  title: string
  version: `${string}.${string}`
}

export type CoreMethod = "GET" | "HEAD" | "DELETE" | "POST" | "PUT" | "PATCH"

/**
 * a record containing types
 */
export type RefsRec = Record<string, RSchema>

export type Mimes = Record<Mime, SchemaOrRef>

export interface CoreRes {
  headers?: OptionalBag
  body?: Mimes
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
  body?: Mimes
}

export interface CoreOp {
  name?: string
  req: CoreReq
  res: CoreResponses
}

export type CorePaths = Record<`/${string}`, Record<CoreMethod, CoreOp>>

export interface CoreService {
  info: ServiceInfo
  refs: RefsRec
  paths: CorePaths
}
