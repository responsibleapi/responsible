import { OpenAPIV3_1 } from "openapi-types"

import { CoreService, ServiceInfo } from "../core/core"
import { RefsRec } from "../core/endpoint"

export const fromOpenApi = <Refs extends RefsRec>(
  d: OpenAPIV3_1.Document,
): CoreService<Refs> => {
  return {
    info: d.info as ServiceInfo,
  }
}
