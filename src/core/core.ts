import {
  Mime,
  PrimitiveBag,
  RefsRec,
  RequiredPrimitiveBag,
  RSchema,
  SchemaOrRef,
} from "./endpoint"

export interface ServiceInfo {
  title: string
  version: `${string}.${string}`
}

export type CoreMethod = "GET" | "HEAD" | "DELETE" | "POST" | "PUT" | "PATCH"

export interface CoreRes<Refs extends RefsRec> {
  headers?: PrimitiveBag<Refs>
  type: Mime
  body: SchemaOrRef<Refs, unknown>
}

export type CoreResponses<Refs extends RefsRec> = Record<
  number,
  {
    headers?: PrimitiveBag<Refs>
    type: Mime
    body: SchemaOrRef<Refs, unknown>
  }
>

export interface CoreOp<Refs extends RefsRec> {
  name?: string

  req: {
    headers: PrimitiveBag<Refs>
    query: PrimitiveBag<Refs>
    params: RequiredPrimitiveBag<Refs>
    body?: {
      type: Mime
      schema: RSchema<Refs, unknown>
    }
  }

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
