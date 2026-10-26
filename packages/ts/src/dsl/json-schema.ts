import type { oas31 } from "openapi3-ts"
import { createComponentRegistryState } from "../compiler/components.ts"
import { emitSchemaRefOrValue } from "../compiler/emit-schema.ts"
import type { Schema } from "./schema.ts"

export interface JSONSchemaOptions {
  objectAdditionalProperties?: boolean
  id?: string
  title?: string
}

export interface JSONSchemaDocument extends oas31.SchemaObject {
  $schema: "https://json-schema.org/draft/2020-12/schema"
  $defs?: oas31.SchemasObject
}

/**
 * Compiles a schema directly to JSON Schema 2020-12. Reusable thunks become
 * local `$defs`; the root stays inline for consumers such as MCP tools. OpenAPI
 * discriminators are omitted: each union variant's `const` tag owns validation
 * in JSON Schema.
 */
export function jsonSchema(
  schema: Schema,
  options: JSONSchemaOptions = {},
): JSONSchemaDocument {
  const state = createComponentRegistryState(options.objectAdditionalProperties)
  state.schemaDialect = "json-schema"
  const emitted = emitSchemaRefOrValue(state, schema)
  let root: oas31.SchemaObject = { ...emitted }
  if (emitted.$ref !== undefined) {
    const name = emitted.$ref
      .slice("#/$defs/".length)
      .replaceAll("~1", "/")
      .replaceAll("~0", "~")
    const definition = state.components.schemas[name]
    if (definition === undefined) {
      throw new Error(`Missing JSON Schema definition ${name}`)
    }
    root = {
      ...definition,
      ...(emitted.description !== undefined
        ? { description: emitted.description }
        : {}),
    }
  }
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    ...root,
    ...(options.id !== undefined ? { $id: options.id } : {}),
    ...(options.title !== undefined ? { title: options.title } : {}),
    ...(Object.keys(state.components.schemas).length > 0
      ? { $defs: state.components.schemas }
      : {}),
  }
}
