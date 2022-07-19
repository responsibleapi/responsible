import {
  constant,
  external,
  httpURL,
  int32,
  string,
  struct,
} from "../../dsl/schema"
import { service } from "../../dsl/endpoint"
import { describe, test } from "vitest"
import { toOpenAPI } from "../openapi"

describe.concurrent("openapi generator", () => {
  test("yanic", () => {
    const s = service(
      {
        title: "yanic",
        version: "1.0.0",
      },
      {
        YtDlInfo: external(),
        YtDlOpts: external(),
      },
      {
        "/info": {
          POST: {
            req: struct({
              url: httpURL(),
              opts: "YtDlOpts",
            }),
            res: {
              200: "YtDlInfo",
              400: string({ minLength: 1 }),
            },
          },
        },
        "/download": {
          POST: {
            req: struct({
              info: "YtDlInfo",
              opts: "YtDlOpts",
            }),
            res: {
              200: constant("ok"),
              400: string({ minLength: 1 }),
            },
          },
        },
      },
      {
        req: { body: "application/json" },
        res: {
          body: "application/json",
          headers: {
            "content-length": int32({ minimum: 1 }),
          },
        },
      },
    )
    console.log(JSON.stringify(toOpenAPI(s), null, 2))
  })
})
