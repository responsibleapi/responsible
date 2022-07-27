import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import {
  CoreMethod,
  CoreOp,
  CorePaths,
  CoreRes,
  CoreResponses,
  CoreService,
  RefsRec,
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
} from "../core/endpoint"
import { ParamWhere } from "./to-open-api"
import { string } from "../dsl/schema"

/**
 * TODO dict
 */
const toObject = <Refs extends RefsRec>({
  properties,
  required,
  additionalProperties,
}: OpenAPIV3_1.NonArraySchemaObject): RSchema<Refs> => {
  const reqSet = new Set(required ?? [])

  if (typeof additionalProperties === "object") {
    return {
      type: "dict",
      k: string(),
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

const toSchema = <Refs extends RefsRec>(
  schema: OpenAPIV3_1.SchemaObject,
): RSchema<Refs> => {
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

const toRefs = <Refs extends RefsRec>(
  schemas: Record<string, OpenAPIV3_1.SchemaObject>,
): Refs =>
  Object.fromEntries(
    Object.entries(schemas).map(([k, v]) => [k, toSchema(v)]),
  ) as Refs

type SchemaRef = `#/components/schemas/${string}`

export const schemaName = (ref: SchemaRef): string =>
  ref.substring(ref.lastIndexOf("schemas/") + 8)

const toProp = <Refs extends RefsRec>({
  $ref,
}: OpenAPIV3_1.ReferenceObject): keyof Refs =>
  schemaName($ref as SchemaRef) as keyof Refs

const schemaOfRef = <Refs extends RefsRec>(
  schema?: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
): SchemaOrRef<Refs> => {
  if (!schema) throw new Error("schema")

  return "$ref" in schema ? toProp(schema) : toSchema(schema)
}

const optional = <Refs extends RefsRec>(
  schema: SchemaOrRef<Refs>,
): Optional<Refs> => ({
  kind: "optional",
  schema,
})

const fromParam = <Refs extends RefsRec>({
  required,
  schema,
}: OpenAPIV3.ParameterObject | OpenAPIV3.HeaderObject):
  | SchemaOrRef<Refs>
  | Optional<Refs> =>
  required ? schemaOfRef(schema) : optional(schemaOfRef(schema))

const fromPathParam = <Refs extends RefsRec>({
  schema,
}: OpenAPIV3.ParameterObject): SchemaOrRef<Refs> => schemaOfRef(schema)

const toOptionalBag = <Refs extends RefsRec>(
  where: ParamWhere,
  op: OpenAPIV3_1.OperationObject,
): OptionalBag<Refs> =>
  Object.fromEntries(
    op.parameters?.flatMap(p =>
      "in" in p && p.in === where ? [[p.name, fromParam(p)]] : [],
    ) ?? [],
  )

export const toRequiredBag = <Refs extends RefsRec>(
  where: "path",
  op: OpenAPIV3_1.OperationObject,
): RequiredBag<Refs> =>
  Object.fromEntries(
    op.parameters?.flatMap(p =>
      "in" in p && p.in === where ? [[p.name, fromPathParam(p)]] : [],
    ) ?? [],
  )

const toResp = <Refs extends RefsRec>(
  r: OpenAPIV3.ResponseObject,
): CoreRes<Refs> => ({
  headers: Object.fromEntries(
    Object.entries(r.headers ?? {}).map(([k, v]) =>
      "$ref" in v ? [k, schemaOfRef(v)] : [k, fromParam(v)],
    ),
  ),
  body: Object.fromEntries(
    Object.entries(r.content ?? {}).map(([k, v]) => [k, schemaOfRef(v.schema)]),
  ),
})

const toOp = <Refs extends RefsRec>(
  op: OpenAPIV3_1.OperationObject,
): CoreOp<Refs> => ({
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
  ) as CoreResponses<Refs>,
})

const METHODS = new Set<string>(Object.values(OpenAPIV3.HttpMethods))

const toMethod = (k: OpenAPIV3.HttpMethods): CoreMethod =>
  k.toUpperCase() as CoreMethod

const isMethod = (k: unknown): k is OpenAPIV3.HttpMethods =>
  typeof k === "string" && METHODS.has(k)

const toOps = <Refs extends RefsRec>(
  item: OpenAPIV3_1.PathItemObject,
): Record<CoreMethod, CoreOp<Refs>> =>
  Object.fromEntries(
    Object.entries(item).flatMap(([k, v]) =>
      isMethod(k)
        ? [[toMethod(k), toOp(v as OpenAPIV3_1.OperationObject)]]
        : [],
    ),
  ) as Record<CoreMethod, CoreOp<Refs>>

const toPaths = <Refs extends RefsRec>(
  paths: OpenAPIV3_1.PathsObject,
): CorePaths<Refs> =>
  Object.fromEntries(
    Object.entries(paths).map(([k, v]) => [
      k,
      toOps(v as OpenAPIV3_1.PathItemObject),
    ]),
  )

export const fromOpenApi = <Refs extends RefsRec>(
  d: OpenAPIV3_1.Document,
): CoreService<Refs> => ({
  info: d.info as ServiceInfo,
  refs: toRefs(d.components?.schemas ?? {}),
  paths: toPaths(d.paths ?? {}),
})
