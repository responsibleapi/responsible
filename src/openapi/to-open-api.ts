import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import {
  isOptional,
  optionalGet,
  PrimitiveBag,
  RefsRec,
  RObject,
  RSchema,
  SchemaOrRef,
  RequiredPrimitiveBag,
} from "../core/endpoint"
import {
  Codes,
  PathWithMethods,
  RRequest,
  Scope,
  ScopeOpts,
  Service,
  flattenScopes,
} from "../dsl/endpoint"
import { CoreMethod, CoreOp, CorePaths, CoreService } from "../core/core"
import { requestBody, requestHeaders } from "../core/request"

const toObj = <Refs extends RefsRec>(
  schema: RObject<Refs>,
): OpenAPIV3.SchemaObject => ({
  type: "object",
  properties: Object.fromEntries(
    Object.entries(schema.fields).map(([name, s]) => [
      name,
      toSchema(refs, optionalGet(s)),
    ]),
  ),
  required: Object.entries(schema.fields).flatMap(([k, v]) =>
    isOptional(v) ? [] : [k],
  ),
})

const toSchema = <Refs extends RefsRec>(
  refs: Refs,
  schema: SchemaOrRef<Refs, unknown>,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  if (typeof schema === "object" && "type" in schema) {
    switch (schema.type) {
      case "object":
        return toObj(schema, refs)

      case "external":
        return { nullable: true }

      default:
        throw new Error(schema.type)
    }
  } else {
    return { $ref: `#/components/schemas/${String(schema)}` }
  }
}

const keyToOpenSchema = <Refs extends RefsRec>(
  refs: Refs,
  name: keyof Refs,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  const schema = refs[name] as RSchema<Refs, unknown>
  return toSchema(refs, schema)
}

const refsToOpenAPI = <Refs extends RefsRec>(
  refs: Refs,
): Record<string, OpenAPIV3.SchemaObject> =>
  Object.fromEntries(Object.keys(refs).map(k => [k, keyToOpenSchema(refs, k)]))

const rBodyObj = <Refs extends RefsRec>(
  refs: Refs,
  s: ScopeOpts<Refs>,
  x: RRequest<Refs>,
): OpenAPIV3.RequestBodyObject | undefined => {
  const reqBodyMime = s.req?.body

  const rBody = requestBody(x)
  if (rBody && !reqBodyMime) {
    throw new Error("there's body but no mime")
  }

  return rBody && reqBodyMime
    ? {
        content: {
          [reqBodyMime]: {
            schema: toSchema(refs, rBody),
          },
        },
      }
    : undefined
}

const toParams = <Refs extends RefsRec>(
  refs: Refs,
  where: "header" | "query" | "path" | "cookie",
  what: PrimitiveBag<Refs> | undefined,
): Array<OpenAPIV3_1.ParameterObject> =>
  Object.entries(what ?? {}).map(([k, v]) => ({
    in: where,
    name: k,
    required: !isOptional(v),
    schema: toSchema(refs, optionalGet(v)),
  }))

const codesToResponses = <Refs extends RefsRec>(
  refs: Refs,
  scope: ScopeOpts<Refs>,
  res: Codes<Refs>,
): OpenAPIV3_1.ResponsesObject => {
  const mime = scope.res?.body
  if (!mime) throw new Error("no mime")

  return Object.fromEntries(
    Object.entries(res).map(([k, v]) => [
      String(k),
      {
        description: String(k),
        content: {
          [mime]: {
            schema: toSchema(refs, v),
          },
        },
      },
    ]),
  )
}

const toOperation = <Refs extends RefsRec>(
  op: CoreOp<Refs>,
): OpenAPIV3.OperationObject => ({
  operationId: op.name,
  parameters: toParams(refs, "header", {
    ...scope.req?.headers,
    ...requestHeaders(req),
  })
    .concat(toParams(refs, "query", req.query))
    .concat(toParams(refs, "path", params)),
  requestBody: rBodyObj(refs, scope, req),
  responses: codesToResponses(refs, scope, req.res),
})

const pathItem = <Refs extends RefsRec>(
  what: Record<CoreMethod, CoreOp<Refs>>,
): OpenAPIV3_1.PathItemObject => {
  return Object.fromEntries(
    Object.entries(what).map(([k, req]) => {
      const method = k.toLowerCase() as OpenAPIV3_1.HttpMethods
      return [method, toOperation(refs, scope, req, params)]
    }),
  )
}

const toMethod = (m: CoreMethod): OpenAPIV3_1.HttpMethods =>
  m.toLowerCase() as OpenAPIV3_1.HttpMethods

const toPaths = <Refs extends RefsRec>(
  paths: CorePaths<Refs>,
): OpenAPIV3_1.PathsObject =>
  Object.fromEntries(
    Object.entries(paths).map(([k, v]) => [
      toMethod(k as CoreMethod),
      pathItem(v),
    ]),
  )

export const toOpenApi = <Refs extends RefsRec>({
  info,
  refs,
  paths,
}: CoreService<Refs>): OpenAPIV3_1.Document => ({
  openapi: "3.1.0",
  info: info,
  components: { schemas: refsToOpenAPI(refs) },
  paths: toPaths(paths),
})
