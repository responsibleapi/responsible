import { OpenAPIV3 } from "openapi-types"

import {
  CoreMethod,
  CoreMimes,
  CoreOp,
  CorePaths,
  CoreRes,
  CoreService,
  CoreStatus,
  CoreTypeRefs,
  StatusCodeStr,
} from "../core/core"
import {
  isKey,
  isOptional,
  Optional,
  OptionalBag,
  optionalGet,
  RStruct,
  RuntimeType,
  schemaGet,
  SchemaOrRef,
} from "../core/schema"

const toObj = (refs: CoreTypeRefs, schema: RStruct): OpenAPIV3.SchemaObject => {
  const required = Object.entries(schema.fields).flatMap(([k, v]) =>
    isOptional(v) ? [] : [k],
  )

  required.sort()

  const entries = Object.entries(schema.fields).map(
    ([name, s]) => [name, toSchemaOrRef(refs, optionalGet(s))] as const,
  )

  return {
    type: "object",
    properties: entries.length ? Object.fromEntries(entries) : undefined,
    required: required.length ? required : undefined,
  }
}

const runtimeTypes: Record<RuntimeType, Readonly<OpenAPIV3.SchemaObject>> = {
  httpURL: {
    type: "string",
    format: "uri",
    pattern: "^https?:\\/\\/\\S+$",
  },
  nat32: { type: "number", format: "int32", minimum: 0 },
  email: { type: "string", format: "email" },
  hostname: { type: "string", format: "hostname" },
  nat64: { type: "number", format: "int64", minimum: 0 },
  seconds: { type: "number", format: "int64" },
  utcMillis: { type: "number", format: "int64" },
  mime: { type: "string" },
}

export const toSchemaOrRef = (
  refs: CoreTypeRefs,
  schema: SchemaOrRef,
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject => {
  if (isKey(refs, schema)) {
    return { $ref: `#/components/schemas/${String(schema)}` }
  }

  switch (schema.type) {
    case "runtime-library": {
      return runtimeTypes[schema.name]
    }

    case "string": {
      return {
        ...schema,
        enum: schema.enum ? [...schema.enum] : undefined,
        additionalProperties: undefined,
      }
    }

    case "number":
    case "boolean":
      return schema

    case "object":
      return toObj(refs, schema)

    case "dict": {
      if (schemaGet(refs, schema.k).type !== "string") {
        throw new Error("dict keys must be strings")
      }

      return {
        type: "object",
        additionalProperties: toSchemaOrRef(refs, schema.v),
      }
    }

    case "unknown":
      return { nullable: true }

    case "external":
      return {}

    case "array":
      return {
        type: "array",
        items: toSchemaOrRef(refs, schema.items),
      }

    default:
      throw new Error(JSON.stringify(schema))
  }
}

const refsToOpenAPI = (
  refs: CoreTypeRefs,
): Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> =>
  Object.fromEntries(
    Object.keys(refs).map(k => [k, toSchemaOrRef(refs, refs[k])]),
  )

export type ParamWhere = "header" | "query" | "path" | "cookie"

export const toParam = (
  refs: CoreTypeRefs,
  name: string,
  v: SchemaOrRef | Optional,
  where: ParamWhere,
): OpenAPIV3.ParameterObject => ({
  in: where,
  name,
  required: isOptional(v) ? undefined : true,
  schema: toSchemaOrRef(refs, optionalGet(v)),
})

const toParams = (
  refs: CoreTypeRefs,
  where: ParamWhere,
  what: OptionalBag | undefined,
): ReadonlyArray<OpenAPIV3.ParameterObject> =>
  Object.entries(what ?? {}).map(([k, v]) => toParam(refs, k, v, where))

const toContent = (
  refs: CoreTypeRefs,
  b: CoreMimes,
): Record<string, OpenAPIV3.MediaTypeObject> =>
  Object.fromEntries(
    Object.entries(b).map(
      ([mime, s]) => [mime, { schema: toSchemaOrRef(refs, s) }] as const,
    ),
  )

const toResponse = (
  refs: CoreTypeRefs,
  status: StatusCodeStr,
  r: CoreStatus,
): OpenAPIV3.ResponseObject => ({
  description: String(status),
  headers: Object.fromEntries(
    Object.entries(r.headers ?? {}).map(([hk, hv]) => [
      hk,
      {
        required: isOptional(hv) ? undefined : true,
        schema: toSchemaOrRef(refs, optionalGet(hv)),
      },
    ]),
  ),
  content: r.body ? toContent(refs, r.body) : undefined,
})

const codesToResponses = (
  refs: CoreTypeRefs,
  res: CoreRes,
): OpenAPIV3.ResponsesObject =>
  Object.fromEntries(
    Object.entries(res).map(([k, v]) => [
      String(k),
      toResponse(refs, k as StatusCodeStr, v),
    ]),
  )

export const compareParams = (
  a: OpenAPIV3.ParameterObject,
  b: OpenAPIV3.ParameterObject,
): number => a.in.localeCompare(b.in) || a.name.localeCompare(b.name)

const toOperation = (
  refs: CoreTypeRefs,
  op: CoreOp,
): OpenAPIV3.OperationObject => {
  const parameters = [
    ...toParams(refs, "header", op.req?.headers),
    ...toParams(refs, "query", op.req?.query),
    ...toParams(refs, "path", op.req?.pathParams),
    ...toParams(refs, "cookie", op.req?.cookies),
  ]

  parameters.sort(compareParams)

  const content = op.req?.body ? toContent(refs, op.req.body) : undefined
  const requestBody =
    content && Object.keys(content).length
      ? { required: true, content }
      : undefined

  return {
    operationId: op.name,
    parameters,
    requestBody,
    responses: codesToResponses(refs, op.res),
    description: op.description,
  }
}

const pathItem = (
  refs: CoreTypeRefs,
  what: Partial<Record<CoreMethod, CoreOp>>,
): OpenAPIV3.PathItemObject =>
  Object.fromEntries(
    Object.entries(what).flatMap(([k, op]) =>
      op ? [[toMethod(k as CoreMethod), toOperation(refs, op)]] : [],
    ),
  )

const toMethod = (m: CoreMethod): OpenAPIV3.HttpMethods =>
  m.toLowerCase() as OpenAPIV3.HttpMethods

const toPaths = (refs: CoreTypeRefs, paths: CorePaths): OpenAPIV3.PathsObject =>
  Object.fromEntries(
    Object.entries(paths).map(([k, v]) => [k, pathItem(refs, v)]),
  )

export const toOpenApi = ({
  info,
  refs,
  paths,
  servers,
}: CoreService): OpenAPIV3.Document => ({
  openapi: "3.0.1",
  info,
  components: { schemas: refsToOpenAPI(refs) },
  paths: toPaths(refs, paths),
  servers: servers ? [...servers] : undefined,
})
