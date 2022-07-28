import { describe, expect, test } from "vitest"

import yanic from "../../tryout/yanic"
import { toCore } from "../to-core"

describe.concurrent("openapi", () => {
  test("yanic", () => {
    const core = toCore(yanic)
    const postInfo = core.paths["/info"].POST
    expect(postInfo.req?.body?.["application/json"]).toBe("InfoReq")
    expect(postInfo.res["200"].body?.["application/json"]).toBe("YtDlInfo")
  })
})
