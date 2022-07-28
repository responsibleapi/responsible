import { describe, test } from "vitest"

import { genPythonTypes } from "../generate"
import { toCore } from "../../dsl/to-core"
import yanic from "../../tryout/yanic"

describe("generate python", () => {
  test("yanic", () => {
    console.log(genPythonTypes(toCore(yanic).refs))
  })
})
