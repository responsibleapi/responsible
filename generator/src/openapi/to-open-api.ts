import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

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
  isOptional,
  Optional,
  OptionalBag,
  optionalGet,
  RStruct,
  SchemaOrRef,
} from "../core/schema"

const toObj = (schema: RStruct): OpenAPIV3.SchemaObject => {
  const required = Object.entries(schema.fields).flatMap(([k, v]) =>
    isOptional(v) ? [] : [k],
  )

  required.sort()

  return {
    type: "object",
    properties: Object.fromEntries(
      Object.entries(schema.fields).map(([name, s]) => [
        name,
        toSchemaOrRef(optionalGet(s)),
      ]),
    ),
    required,
  }
}

export const toSchemaOrRef = (
  schema: SchemaOrRef,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  if (typeof schema === "object" && "type" in schema) {
    switch (schema.type) {
      case "runtime-library": {
        switch (schema.name) {
          case "httpURL":
            return { type: "string", format: "uri" }
          case "nat32":
            return { type: "number", format: "int32", minimum: 0 }
          case "email":
            return { type: "string", format: "email" }
          case "hostname":
            return { type: "string", format: "hostname" }

          case "nat64":
            return { type: "number", format: "int64", minimum: 0 }

          case "seconds":
            return { type: "number", format: "int64" }

          case "utcMillis":
            return { type: "number", format: "int64" }

          case "mime":
            return { type: "string" }

          default:
            throw new Error(`Unknown runtime library type ${schema.name}`)
        }
      }

      case "newtype": {
        return toSchemaOrRef(schema.schema)
      }

      case "string": {
        return {
          ...schema,
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
          items: toSchemaOrRef(schema.items),
        }

      default:
        throw new Error(schema.type)
    }
  } else {
    return { $ref: `#/components/schemas/${String(schema)}` }
  }
}

const refsToOpenAPI = (
  refs: CoreTypeRefs,
): Record<string, OpenAPIV3.SchemaObject> =>
  Object.fromEntries(Object.keys(refs).map(k => [k, toSchemaOrRef(refs[k])]))

export type ParamWhere = "header" | "query" | "path" | "cookie"

export const toParam = (
  name: string,
  v: SchemaOrRef | Optional,
  where: ParamWhere,
): OpenAPIV3_1.ParameterObject => ({
  in: where,
  name,
  required: isOptional(v) ? undefined : true,
  schema: toSchemaOrRef(optionalGet(v)),
})

const toParams = (
  where: ParamWhere,
  what: OptionalBag | undefined,
): ReadonlyArray<OpenAPIV3_1.ParameterObject> =>
  Object.entries(what ?? {}).map(([k, v]) => toParam(k, v, where))

const toContent = (b: CoreMimes): Record<string, OpenAPIV3.MediaTypeObject> =>
  Object.fromEntries(
    Object.entries(b).map(([type, s]) => [type, { schema: toSchemaOrRef(s) }]),
  )

const toResponse = (
  status: StatusCodeStr,
  r: CoreStatus,
): OpenAPIV3_1.ResponseObject => ({
  description: String(status),
  headers: Object.fromEntries(
    Object.entries(r.headers ?? {}).map(([hk, hv]) => [
      hk,
      {
        required: isOptional(hv) ? undefined : true,
        schema: toSchemaOrRef(optionalGet(hv)),
      },
    ]),
  ),
  content: r.body ? toContent(r.body) : undefined,
})

const codesToResponses = (res: CoreRes): OpenAPIV3_1.ResponsesObject =>
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

const toOperation = (op: CoreOp): OpenAPIV3.OperationObject => {
  const parameters = toParams("header", op.req?.headers)
    .concat(toParams("query", op.req?.query))
    .concat(toParams("path", op.req?.pathParams))
    .concat(toParams("cookie", op.req?.cookies))

  parameters.sort(compareParams)

  return {
    operationId: op.name,
    parameters,
    requestBody: op.req?.body
      ? { required: true, content: toContent(op.req.body) }
      : undefined,
    responses: codesToResponses(op.res),
    description: op.description,
  }
}

const pathItem = (
  what: Record<CoreMethod, CoreOp>,
): OpenAPIV3_1.PathItemObject =>
  Object.fromEntries(
    Object.entries(what).flatMap(([k, op]) =>
      op ? [[toMethod(k as CoreMethod), toOperation(op)]] : [],
    ),
  )

const toMethod = (m: CoreMethod): OpenAPIV3_1.HttpMethods =>
  m.toLowerCase() as OpenAPIV3_1.HttpMethods

const toPaths = (paths: CorePaths): OpenAPIV3_1.PathsObject =>
  Object.fromEntries(Object.entries(paths).map(([k, v]) => [k, pathItem(v)]))

export const toOpenApi = ({
  info,
  refs,
  paths,
  servers,
}: CoreService): OpenAPIV3_1.Document => ({
  openapi: "3.1.0",
  info,
  components: { schemas: refsToOpenAPI(refs) },
  paths: toPaths(paths),
  servers: servers ? [...servers] : undefined,
})
