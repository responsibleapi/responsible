import { describe, test } from "vitest"

import { genPythonTypes } from "./dataclasses"
import { toCore } from "../dsl/to-core"
import yanic from "../../tryout/yanic"

describe.concurrent("generate python", () => {
  test("yanic", () => {
    console.log(genPythonTypes(toCore(yanic).refs))
  })
})
