import { methodGenerics } from "./vertx-client"
import { describe, expect, test } from "vitest"
import { kdlToCore } from "../dsl/kdl/kdl"
import { readFile } from "fs/promises"
import { parse } from "kdljs"

describe.concurrent("vertx-client", () => {
  test("method generics", async () => {
    const { paths, refs } = kdlToCore(
      parse(await readFile("tryout/yanic.kdl", "utf-8")).output,
    )

    expect(methodGenerics(refs, paths["/info"].POST)).toEqual({
      YtDlInfo: "reified",
      YtDlOpts: "",
    })
  })
})
