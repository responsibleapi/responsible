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

export type RefsRec = Record<string, RSchema<any>>

export type Mimes<Refs extends RefsRec> = Record<Mime, SchemaOrRef<Refs>>

export interface CoreRes<Refs extends RefsRec> {
  headers?: OptionalBag<Refs>
  body?: Mimes<Refs>
}

type StatusCode1 = "1" | "2" | "3" | "4" | "5"
type DigitStr = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
export type StatusCodeStr = `${StatusCode1}${DigitStr}${DigitStr}`

export type CoreResponses<Refs extends RefsRec> = Record<
  StatusCodeStr,
  CoreRes<Refs>
>

export interface CoreReq<Refs extends RefsRec> {
  headers?: OptionalBag<Refs>
  query?: OptionalBag<Refs>
  params?: RequiredBag<Refs>
  cookies?: OptionalBag<Refs>
  body?: Mimes<Refs>
}

export interface CoreOp<Refs extends RefsRec> {
  name?: string
  req: CoreReq<Refs>
  res: CoreResponses<Refs>
}

export type CorePaths<Refs extends RefsRec> = Record<
  `/${string}`,
  Record<CoreMethod, CoreOp<Refs>>
>

export interface CoreService<Refs extends RefsRec> {
  info: ServiceInfo
  refs: Refs
  paths: CorePaths<Refs>
}
