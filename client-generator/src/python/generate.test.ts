import { describe, test } from "vitest"

import yanic from "../../../tryout/src/yanic"
import { genPythonTypes } from "./generate"
import { toCore } from "../dsl/to-core"

describe.concurrent("generate python", () => {
  test("yanic", () => {
    console.log(genPythonTypes(toCore(yanic).refs))
  })
})
