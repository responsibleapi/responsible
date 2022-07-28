import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import {
  Body,
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreRes,
  CoreResponses,
  CoreService,
  RefsRec,
  StatusCodeStr,
} from "../core/core"
import {
  isOptional,
  Optional,
  OptionalBag,
  optionalGet,
  RObject,
  RSchema,
  SchemaOrRef,
} from "../core/endpoint"

const toObj = <Refs extends RefsRec>(
  schema: RObject<Refs>,
): OpenAPIV3.SchemaObject => {
  const required = Object.entries(schema.fields).flatMap(([k, v]) =>
    isOptional(v) ? [] : [k],
  )

  required.sort()

  return {
    type: "object",
    properties: Object.fromEntries(
      Object.entries(schema.fields).map(([name, s]) => [
        name,
        toSchema(optionalGet(s)),
      ]),
    ),
    required,
  }
}

export const toSchema = <Refs extends RefsRec>(
  schema: SchemaOrRef<Refs>,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  if (typeof schema === "object" && "type" in schema) {
    switch (schema.type) {
      case "string": {
        const { ...copy } = schema
        delete copy.template
        return {
          ...copy,
          pattern: schema.pattern?.toString(),
          enum: schema.enum ? [...schema.enum] : undefined,
        }
      }

      case "number":
        return schema

      case "object":
        return toObj(schema)

      case "unknown":
      case "external":
        return { nullable: true }

      case "array":
        return {
          type: "array",
          items: toSchema(schema.items),
        }

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
      toSchema(refs[k] as RSchema<Refs>),
    ]),
  ) as Record<keyof Refs, OpenAPIV3.SchemaObject>

export type ParamWhere = "header" | "query" | "path" | "cookie"

export const toParam = <Refs extends RefsRec>(
  name: string,
  v: SchemaOrRef<Refs> | Optional<Refs>,
  where: ParamWhere,
): OpenAPIV3_1.ParameterObject => ({
  in: where,
  name,
  required: isOptional(v) ? undefined : true,
  schema: toSchema(optionalGet(v)),
})

const toParams = <Refs extends RefsRec>(
  where: ParamWhere,
  what: OptionalBag<Refs> | undefined,
): ReadonlyArray<OpenAPIV3_1.ParameterObject> =>
  Object.entries(what ?? {}).map(([k, v]) => toParam(k, v, where))

const toContent = <Refs extends RefsRec>(
  b: Body<Refs>,
): Record<string, OpenAPIV3.MediaTypeObject> =>
  Object.fromEntries(
    Object.entries(b).map(([type, s]) => [type, { schema: toSchema(s) }]),
  )

const toResponse = <Refs extends RefsRec>(
  status: StatusCodeStr,
  r: CoreRes<Refs>,
): OpenAPIV3_1.ResponseObject => ({
  description: String(status),
  headers: Object.fromEntries(
    Object.entries(r.headers ?? {}).map(([hk, hv]) => [
      hk,
      {
        required: isOptional(hv) ? undefined : true,
        schema: toSchema(optionalGet(hv)),
      },
    ]),
  ),
  content: toContent(r.body),
})

const codesToResponses = <Refs extends RefsRec>(
  res: CoreResponses<Refs>,
): OpenAPIV3_1.ResponsesObject =>
  Object.fromEntries(
    Object.entries(res).map(([k, v]) => [
      String(k),
      toResponse(k as StatusCodeStr, v),
    ]),
  )

export const compareParams = (
  a: OpenAPIV3_1.ParameterObject,
  b: OpenAPIV3_1.ParameterObject,
): number => a.in.localeCompare(b.in) || a.name.localeCompare(b.name)

const toOperation = <Refs extends RefsRec>(
  op: CoreOp<Refs>,
): OpenAPIV3.OperationObject => {
  const parameters = toParams("header", op.req?.headers)
    .concat(toParams("query", op.req?.query))
    .concat(toParams("path", op.req?.params))
    .concat(toParams("cookie", op.req?.cookies))

  parameters.sort(compareParams)

  return {
    operationId: op.name,
    parameters,
    requestBody: op.req?.body
      ? {
          content: toContent(op.req.body),
        }
      : undefined,
    responses: codesToResponses(op.res),
  }
}

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
