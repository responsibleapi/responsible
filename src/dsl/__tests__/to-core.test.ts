import { describe, expect, test } from "vitest"

import { isMimes, toCore } from "../to-core"
import yanic from "../../tryout/yanic"

describe.concurrent("openapi", () => {
  test("yanic", () => {
    const core = toCore(yanic)
    const postInfo = core.paths["/info"].POST
    expect(postInfo.req?.body?.["application/json"]).toBe("InfoReq")
    expect(postInfo.res["200"].body?.["application/json"]).toBe("YtDlInfo")
  })

  test("is body", () => {
    expect(isMimes({ body: {} })).toBeFalsy()
    expect(isMimes({ "application/json": "InfoReq" })).toBeTruthy()
  })
})
