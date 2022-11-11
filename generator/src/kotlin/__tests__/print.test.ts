import { describe, test } from "vitest"

import { genVertxKotlinClient } from "../vertx-client"
import { toCore } from "../../dsl/to-core"
import { genKotlinTypes } from "../types"
import { parse } from "kdljs"

describe.concurrent("generate kotlin", () => {
  test("types", () => {
    console.log(genKotlinTypes(toCore(parse()).refs))
  })

  test("client", () => {
    console.log(
      genVertxKotlinClient(toCore(yanic), {
        packageName: "listenbox.yanic",
      }),
    )
  })
})
