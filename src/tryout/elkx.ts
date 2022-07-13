import { external, int32, struct, unknown } from "../dsl/schema"
import { service } from "../dsl/endpoint"

const ElkNode = external<object>("ElkNode")
const LayoutOpts = external<object>("LayoutOpts")

export default service(
  "elkx",
  {
    "/json": {
      POST: {
        req: struct("LayoutReq", {
          root: ElkNode,
          opts: LayoutOpts,
        }),
        res: {
          200: ElkNode,
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
