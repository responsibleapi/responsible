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

    InfoReq: struct({
      url: httpURL(),
      opts: "YtDlOpts",
    }),

    DownloadReq: struct({
      info: "YtDlInfo",
      opts: "YtDlOpts",
    }),
  },
  {
    "/info": {
      POST: {
        req: "InfoReq",
        res: { 200: "YtDlInfo" },
      },
    },
    "/download": {
      POST: {
        req: "DownloadReq",
        res: { 200: unknown() },
      },
    },
  },
  {
    req: { body: "application/json" },
    res: {
      body: "application/json",
      headers: { "content-length": int32({ minimum: 1 }) },

      /**
       * TODO responses can be components
       */
      codes: {
        400: { "text/plain": string({ minLength: 1 }) },
        422: { "text/plain": string({ minLength: 1 }) },
      },
    },
  },
)
