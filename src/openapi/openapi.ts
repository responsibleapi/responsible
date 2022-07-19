import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types"

import { isOptional, isRef, RefsRec } from "../core/service"
import { Service } from "../dsl/endpoint"

const schemaToOpenAPI = <Refs extends RefsRec>(
  refs: Refs,
  k: keyof Refs,
): OpenAPIV3_1.ReferenceObject | OpenAPIV3.SchemaObject => {
  const schema = refs[k]

  if (isRef(refs, schema)) {
    return { $ref: `#/components/schemas/${String(schema)}` }
  }

  switch (schema.type) {
    case "object":
      return {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(schema.fields).map(([k, schema]) => [
            k,
            schemaToOpenAPI(refs, k),
          ]),
        ),
        required: Object.entries(schema.fields).flatMap(([k, v]) =>
          isOptional(v) ? [] : [k],
        ),
      }

    case "external":
      return { nullable: true }

    default:
      throw new Error(schema.type)
  }
}

const refsToOpenAPI = <Refs extends RefsRec>(
  refs: Refs,
): Record<string, OpenAPIV3.SchemaObject> =>
  Object.fromEntries(Object.keys(refs).map(k => [k, schemaToOpenAPI(refs, k)]))

export const toOpenAPI = <Refs extends RefsRec>(
  s: Service<Refs>,
): OpenAPIV3_1.Document => ({
  openapi: "3.1.0",
  info: s.info,
  components: { schemas: refsToOpenAPI(s.refs) },
  paths: {},
})
