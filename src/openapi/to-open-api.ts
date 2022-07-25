import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import {
  isOptional,
  optionalGet,
  PrimitiveBag,
  RefsRec,
  RObject,
  RSchema,
  SchemaOrRef,
} from "../core/endpoint"
import {
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreRes,
  CoreResponses,
  CoreService,
} from "../core/core"

const toObj = <Refs extends RefsRec>(
  schema: RObject<Refs>,
): OpenAPIV3.SchemaObject => ({
  type: "object",
  properties: Object.fromEntries(
    Object.entries(schema.fields).map(([name, s]) => [
      name,
      toSchema(optionalGet(s)),
    ]),
  ),
  required: Object.entries(schema.fields).flatMap(([k, v]) =>
    isOptional(v) ? [] : [k],
  ),
})

const toSchema = <Refs extends RefsRec>(
  schema: SchemaOrRef<Refs, unknown>,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  if (typeof schema === "object" && "type" in schema) {
    switch (schema.type) {
      case "string":
        return { ...schema, pattern: schema.pattern?.toString() }

      case "number":
        return schema

      case "object":
        return toObj(schema)

      case "external":
        return { nullable: true }

      default:
        throw new Error(schema.type)
    }
  } else {
    return { $ref: `#/components/schemas/${String(schema)}` }
  }
}

const refsToOpenAPI = <Refs extends RefsRec>(
  refs: Refs,
): Record<keyof Refs, OpenAPIV3.SchemaObject> =>
  Object.fromEntries(
    Object.keys(refs).map(k => [
      k as keyof Refs,
      toSchema(refs[k] as RSchema<Refs, unknown>),
    ]),
  ) as Record<keyof Refs, OpenAPIV3.SchemaObject>

type Where = "header" | "query" | "path" | "cookie"

const toParam = <Refs extends RefsRec>(
  k: string,
  v: PrimitiveBag<Refs>[string],
  where: Where,
) => ({
  in: where,
  name: k,
  required: !isOptional(v),
  schema: toSchema(optionalGet(v)),
})

const toParams = <Refs extends RefsRec>(
  where: Where,
  what: PrimitiveBag<Refs> | undefined,
): ReadonlyArray<OpenAPIV3_1.ParameterObject> =>
  Object.entries(what ?? {}).map(([k, v]) => toParam(k, v, where))

const toResponse = <Refs extends RefsRec>(
  k: number,
  v: CoreRes<Refs>,
): OpenAPIV3_1.ResponseObject => ({
  description: String(k),
  content: { [v.type]: { schema: toSchema(v.body) } },
  headers: Object.fromEntries(
    Object.entries(v.headers ?? {}).map(([hk, hv]) => [
      hk,
      toParam(hk, hv, "header"),
    ]),
  ),
})

const codesToResponses = <Refs extends RefsRec>(
  res: CoreResponses<Refs>,
): OpenAPIV3_1.ResponsesObject =>
  Object.fromEntries(
    Object.entries(res).map(([k, v]) => [
      String(k),
      toResponse(parseInt(k), v),
    ]),
  )

const toOperation = <Refs extends RefsRec>(
  op: CoreOp<Refs>,
): OpenAPIV3.OperationObject => ({
  operationId: op.name,
  parameters: toParams("header", op.req.headers)
    .concat(toParams("query", op.req.query))
    .concat(toParams("path", op.req.params)),
  requestBody: op.req.body
    ? {
        content: {
          [op.req.body.type]: {
            schema: toSchema(op.req.body.schema),
          },
        },
      }
    : undefined,
  responses: codesToResponses(op.res),
})

const pathItem = <Refs extends RefsRec>(
  what: Record<CoreMethod, CoreOp<Refs>>,
): OpenAPIV3_1.PathItemObject =>
  Object.fromEntries(
    Object.entries(what).map(([k, op]) => [
      toMethod(k as CoreMethod),
      toOperation(op),
    ]),
  )

const toMethod = (m: CoreMethod): OpenAPIV3_1.HttpMethods =>
  m.toLowerCase() as OpenAPIV3_1.HttpMethods

const toPaths = <Refs extends RefsRec>(
  paths: CorePaths<Refs>,
): OpenAPIV3_1.PathsObject =>
  Object.fromEntries(Object.entries(paths).map(([k, v]) => [k, pathItem(v)]))

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
