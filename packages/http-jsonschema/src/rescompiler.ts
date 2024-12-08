import type { oas31 } from "openapi3-ts"
import { contentToSchema, type MetaBody } from "./bodycompiler"
import type { JsonResolver } from "./jsonresolver"
import { type TypedSchema, unionSchema, type UnionSchema } from "./typedschema"

type HeadersObj = Record<Lowercase<string>, string>

function compileHeaders(
  refs: JsonResolver<oas31.OpenAPIObject>,
  headers: Record<string, oas31.HeaderObject | oas31.ReferenceObject>,
): TypedSchema<HeadersObj> {
  const properties: Record<
    Lowercase<string>,
    oas31.SchemaObject | oas31.ReferenceObject
  > = {}

  const required = Array<Lowercase<string>>()

  for (const header in headers) {
    const resolved = refs.resolve(headers[header])
    const schema = resolved.schema
    if (!schema) continue

    const canon = header.toLowerCase() as Lowercase<string>
    properties[canon] = schema
    if (resolved.required) {
      required.push(canon)
    }
  }

  return { type: "object", properties, required }
}

export interface ResBuf {
  status: number
  headers: HeadersObj
  body: MetaBody
}

export const responsesToSchema = (
  refs: JsonResolver<oas31.OpenAPIObject>,
  responses: oas31.ResponsesObject,
): UnionSchema<ResBuf> => {
  const oneOf = Array<TypedSchema<ResBuf>>()

  for (const status in responses) {
    const { content, headers } = refs.resolve(
      responses[status],
    ) as oas31.ResponseObject

    oneOf.push({
      type: "object",
      properties: {
        status: { type: "integer", const: Number(status) },
        headers: headers ? compileHeaders(refs, headers) : {},
        body: content ? contentToSchema(content) : {},
      },
      required: ["status", "headers", "body"],
    })
  }

  return unionSchema(oneOf)
}
