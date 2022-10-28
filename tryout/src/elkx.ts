import { service, r } from "@responsible/generator"

export default service(
  {
    title: "elkx",
    version: "0.1.0",
  },
  {
    ElkNode: r.external(),
    LayoutOpts: r.external(),
  },
  {
    "/json": {
      POST: {
        req: r.struct({
          root: "ElkNode",
          opts: "LayoutOpts",
        }),
        res: {
          200: "ElkNode",
          500: r.unknown(),
        },
      },
    },
  },
  {
    req: { body: "application/json" },
    res: {
      body: "application/json",
      headers: {
        "content-length": r.int32({ minimum: 1 }),
      },
    },
  },
)
