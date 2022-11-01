import { describe, test } from "vitest"

import yanic from "../../tryout/yanic"
import { genPythonTypes } from "./dataclasses"
import { toCore } from "../dsl/to-core"

describe.concurrent("generate python", () => {
  test("yanic", () => {
    console.log(genPythonTypes(toCore(yanic).refs))
  })
})
