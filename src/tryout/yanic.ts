import {
  constant,
  external,
  httpURL,
  int32,
  string,
  struct,
} from "../dsl/schema"
import { service } from "../dsl/endpoint"

const YtDlInfo = external<object>("YtDlInfo")
const YtDlOpts = external<object>("YtDlOpts")

export default service(
  "yanic",
  {
    "/info": {
      POST: {
        req: struct("InfoReq", {
          url: httpURL(),
          opts: YtDlOpts,
        }),
        res: {
          200: YtDlInfo,
          400: string({ minLength: 1 }),
        },
      },
    },
    "/download": {
      POST: {
        req: struct("DownloadReq", {
          info: YtDlInfo,
          opts: YtDlOpts,
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
