import { external, int32, struct, unknown } from "../dsl/schema"
import { service } from "../dsl/endpoint"

export default service(
  {
    title: "elkx",
    version: "0.1.0",
  },
  {
    ElkNode: external(),
    LayoutOpts: external(),
  },
  {
    "/json": {
      POST: {
        req: struct({
          root: "ElkNode",
          opts: "LayoutOpts",
        }),
        res: {
          200: "ElkNode",
          500: unknown(),
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
