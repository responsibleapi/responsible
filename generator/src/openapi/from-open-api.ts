import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import {
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreResponses,
  CoreService,
  CoreStatus,
  CoreTypeRefs,
  ServiceInfo,
} from "../core/core"
import {
  NumFormat,
  Optional,
  OptionalBag,
  RequiredBag,
  RSchema,
  SchemaOrRef,
  StringFormat,
} from "../core/RSchema"
import { ParamWhere } from "./to-open-api"

/**
 * TODO dict
 */
const toObject = ({
  properties,
  required,
  additionalProperties,
}: OpenAPIV3_1.NonArraySchemaObject): RSchema => {
  const reqSet = new Set(required ?? [])

  if (typeof additionalProperties === "object") {
    return {
      type: "dict",
      k: { type: "string" },
      v: schemaOfRef(additionalProperties),
    }
  }

  return {
    type: "object",
    fields: Object.fromEntries(
      Object.entries(properties ?? {}).map(([k, v]) => [
        k,
        reqSet.has(k) ? schemaOfRef(v) : optional(schemaOfRef(v)),
      ]),
    ),
  }
}

const toSchema = (schema: OpenAPIV3_1.SchemaObject): RSchema => {
  switch (schema.type) {
    case undefined:
      return { type: "unknown" }

    case "string":
      return {
        ...schema,
        type: "string",
        format: schema.format as StringFormat,
        pattern: schema.pattern ? new RegExp(schema.pattern) : undefined,
      }

    case "number":
      return { ...schema, type: "number", format: schema.format as NumFormat }

    case "object":
      return toObject(schema)

    case "array":
      return { type: "array", items: schemaOfRef(schema.items) }

    default:
      throw new Error(JSON.stringify(schema.type))
  }
}

const toRefs = (
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): CoreTypeRefs =>
  Object.fromEntries(Object.entries(schemas).map(([k, v]) => [k, toSchema(v)]))

type SchemaRef = `#/components/schemas/${string}`

export const schemaName = (ref: SchemaRef): string =>
  ref.substring(ref.lastIndexOf("schemas/") + 8)

const toProp = ({ $ref }: OpenAPIV3_1.ReferenceObject): string =>
  schemaName($ref as SchemaRef)

const schemaOfRef = (
  schema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
): SchemaOrRef => {
  if (!schema) throw new Error("schema")

  return "$ref" in schema ? toProp(schema) : toSchema(schema)
}

const optional = (schema: SchemaOrRef): Optional => ({
  type: "optional",
  schema,
})

const fromParam = ({
  required,
  schema,
}: OpenAPIV3.ParameterObject | OpenAPIV3.HeaderObject):
  | SchemaOrRef
  | Optional => (required ? schemaOfRef(schema) : optional(schemaOfRef(schema)))

const fromPathParam = ({ schema }: OpenAPIV3.ParameterObject): SchemaOrRef =>
  schemaOfRef(schema)

const toOptionalBag = (
  where: ParamWhere,
  op: OpenAPIV3_1.OperationObject,
): OptionalBag =>
  Object.fromEntries(
    op.parameters?.flatMap(p =>
      "in" in p && p.in === where ? [[p.name, fromParam(p)]] : [],
    ) ?? [],
  )

export const toRequiredBag = (
  where: "path",
  op: OpenAPIV3_1.OperationObject,
): RequiredBag =>
  Object.fromEntries(
    op.parameters?.flatMap(p =>
      "in" in p && p.in === where ? [[p.name, fromPathParam(p)]] : [],
    ) ?? [],
  )

const toResp = (r: OpenAPIV3.ResponseObject): CoreStatus => ({
  headers: Object.fromEntries(
    Object.entries(r.headers ?? {}).map(([k, v]) =>
      "$ref" in v ? [k, schemaOfRef(v)] : [k, fromParam(v)],
    ),
  ),
  body: Object.fromEntries(
    Object.entries(r.content ?? {}).map(([k, v]) => [k, schemaOfRef(v.schema)]),
  ),
})

const toOp = (op: OpenAPIV3_1.OperationObject): CoreOp => ({
  name: op.operationId,
  req: {
    params: toRequiredBag("path", op),
    headers: toOptionalBag("header", op),
    query: toOptionalBag("query", op),
    cookies: toOptionalBag("cookie", op),
  },
  res: Object.fromEntries(
    Object.entries(op.responses ?? {}).flatMap(([k, v]) =>
      "$ref" in v ? [] : [[k, toResp(v)]],
    ),
  ) as CoreResponses,
})

const METHODS = new Set<string>(Object.values(OpenAPIV3.HttpMethods))

const toMethod = (k: OpenAPIV3.HttpMethods): CoreMethod =>
  k.toUpperCase() as CoreMethod

const isMethod = (k: unknown): k is OpenAPIV3.HttpMethods =>
  typeof k === "string" && METHODS.has(k)

const toOps = (item: OpenAPIV3_1.PathItemObject): Record<CoreMethod, CoreOp> =>
  Object.fromEntries(
    Object.entries(item).flatMap(([k, v]) =>
      isMethod(k)
        ? [[toMethod(k), toOp(v as OpenAPIV3_1.OperationObject)]]
        : [],
    ),
  ) as Record<CoreMethod, CoreOp>

const toPaths = (paths: OpenAPIV3_1.PathsObject): CorePaths =>
  Object.fromEntries(
    Object.entries(paths).map(([k, v]) => [
      k,
      toOps(v as OpenAPIV3_1.PathItemObject),
    ]),
  )

export const fromOpenApi = (d: OpenAPIV3_1.Document): CoreService => ({
  info: d.info as ServiceInfo,
  refs: toRefs(d.components?.schemas ?? {}),
  paths: toPaths(d.paths ?? {}),
  servers: d.servers ?? [],
})
