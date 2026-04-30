import { responsibleAPI } from "../dsl/dsl.ts"
import { GET } from "../dsl/methods.ts"
import { anyOf, array, int64, object, string, unknown } from "../dsl/schema.ts"
import { scope } from "../dsl/scope.ts"

const AppID = () =>
  string({
    pattern: /^app_\w+$/,
    examples: ["app_123"],
  })

const ErrID = () =>
  string({
    pattern: /^err_\w+$/,
    examples: ["err_123"],
  })

const NonEmptyStr = () => string({ minLength: 1 })

const NewErr = () =>
  anyOf([
    object({ stack: NonEmptyStr, message: NonEmptyStr }),
    object({ stack: NonEmptyStr }),
    object({ message: NonEmptyStr }),
  ])

const UnixMillis = () =>
  int64({
    description: "UNIX epoch milliseconds",
    examples: [1739982555384],
  })

const OneErr = () =>
  object({
    id: ErrID,
    "stack?": NonEmptyStr,
    "message?": NonEmptyStr,
    "resolvedAt?": UnixMillis,
  })

const ErrLog = () =>
  object({
    id: string({ format: "uuid" }),
    errID: ErrID,
    ts: UnixMillis,
  })

export default responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "Exceptions API",
      version: "1",
      description: "Sentry.io clone",
    },
  },
  forEachOp: {
    req: {
      mime: "application/json",
    },
    res: {
      mime: "application/json",
      add: {
        /** TODO describe your validation lib err schema */
        400: unknown(),
      },
    },
  },
  routes: {
    "/app_errors/:appID": scope({
      pathParams: { appID: AppID },
      POST: {
        id: "newError",
        req: NewErr,
        res: { 201: unknown() },
      },
      GET: {
        id: "appErrors",
        res: { 200: array(OneErr) },
      },
    }),
    "/errors/:errID": GET({
      id: "errorOccurrences",
      req: { pathParams: { errID: ErrID } },
      res: { 200: array(ErrLog) },
    }),
  },
})
