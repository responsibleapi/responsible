import {
  external,
  httpURL,
  int32,
  string,
  struct,
  unknown,
} from "../dsl/schema"
import { service } from "../dsl/endpoint"

export default service(
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
          200: unknown(),
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
