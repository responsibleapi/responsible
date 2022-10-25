import { describe, test } from "vitest"

import { toOpenApi } from "@responsible/client-generator/src/openapi/to-open-api"
import { toCore } from "@responsible/client-generator/src/dsl/to-core"
import listenbox from "../listenbox"
import yanic from "../yanic"

describe.concurrent("printing", () => {
  test("yanic", () => {
    console.log(JSON.stringify(toOpenApi(toCore(yanic)), null, 2))
  })

  test("listenbox", () => {
    console.log(JSON.stringify(toOpenApi(toCore(listenbox)), null, 2))
  })
})
