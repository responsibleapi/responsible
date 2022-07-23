import { OpenAPIV3_1 } from "openapi-types"

import { RefsRec } from "../core/endpoint"
import { CorePaths } from "../core/core"

export const fromOpenApi = <Refs extends RefsRec>(
  d: OpenAPIV3_1.Document,
): CorePaths<Refs> => {}
