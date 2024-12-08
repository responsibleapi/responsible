import type { oas31 } from "openapi3-ts"
import { contentToSchema, type MetaBody } from "./bodycompiler"
import type { JsonResolver } from "./jsonresolver"
import type { TypedSchema } from "./typedschema"

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type MutableObjSchema = {
  type: "object"
  properties: Record<string, oas31.SchemaObject | oas31.ReferenceObject>
  required: string[]
}

const emptyObjSchema = (): MutableObjSchema => ({
  type: "object",
  properties: {},
  required: [],
})

function compileParams(
  refs: JsonResolver<oas31.OpenAPIObject>,
  params: Array<oas31.ReferenceObject | oas31.ParameterObject>,
): TypedSchema<Record<oas31.ParameterLocation, Record<string, string>>> {
  const properties: Record<oas31.ParameterLocation, MutableObjSchema> = {
    path: emptyObjSchema(),
    header: emptyObjSchema(),
    query: emptyObjSchema(),
    cookie: emptyObjSchema(),
  }

  for (const paramSchema of params) {
    const { in: paramIn, name, schema, required } = refs.resolve(paramSchema)
    if (!schema) continue

    const field = properties[paramIn]
    const canonName = paramIn === "header" ? name.toLowerCase() : name
    field.properties[canonName] = schema
    if (required) {
      field.required.push(canonName)
    }
  }

  return {
    type: "object",
    properties,
    required: ["path", "header", "query", "cookie"],
  }
}

export interface ReqBuf {
  params: Record<oas31.ParameterLocation, Record<string, string>>
  body: MetaBody
}

export function requestToSchema(
  refs: JsonResolver<oas31.OpenAPIObject>,
  op: oas31.OperationObject,
): TypedSchema<ReqBuf> {
  const body: oas31.RequestBodyObject | undefined = op.requestBody
    ? refs.resolve(op.requestBody)
    : undefined

  const required = Array<keyof ReqBuf>()
  if (op.parameters?.length) required.push("params")
  if (body?.required) required.push("body")

  return {
    type: "object",
    properties: {
      params: op.parameters?.length ? compileParams(refs, op.parameters) : {},
      body: body ? contentToSchema(body.content) : {},
    },
    required,
  }
}
