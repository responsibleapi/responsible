import {
  Bodied,
  Bodiless,
  PrimitiveBag,
  SchemaOrRef,
} from "./endpoint"
import { ROp } from "../dsl/endpoint"
import { RefsRec } from "./core"

export const requestBody = <Refs extends RefsRec>(
  b: ROp<Refs>,
): SchemaOrRef<Refs, unknown> | undefined => {
  if ("req" in b) {
    return typeof b.req === "object" && "body" in b.req ? b.req.body : b.req
  }
}

export const requestHeaders = <Refs extends RefsRec>(
  b: ROp<Refs>,
): PrimitiveBag<Refs> | undefined => {
  if ("reqHeaders" in b) {
    return b.reqHeaders
  }

  if ("req" in b && typeof b.req === "object" && "headers" in b.req) {
    return b.req.headers
  }
}
