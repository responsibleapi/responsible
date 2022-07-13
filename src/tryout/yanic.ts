import {
  constant,
  external,
  httpURL,
  int32,
  string,
  struct,
} from "../dsl/schema"
import { service } from "../dsl/endpoint"

export default service(
  "yanic",
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
