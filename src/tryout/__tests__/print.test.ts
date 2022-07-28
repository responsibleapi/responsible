import { describe, test } from "vitest"

import { toOpenApi } from "../../openapi/to-open-api"
import { toCore } from "../../dsl/to-core"
import yanic from "../yanic"

describe.concurrent("printing", () => {
  test("yanic", () => {
    console.log(JSON.stringify(toOpenApi(toCore(yanic)), null, 2))
  })
})
