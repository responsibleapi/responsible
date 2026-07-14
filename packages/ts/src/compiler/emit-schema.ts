import type { oas31 } from "openapi3-ts"
import { decodeNameable } from "../dsl/nameable.ts"
import type { Discriminator, Obj, RawSchema, Schema } from "../dsl/schema.ts"
import { deepEqual } from "../help/deep-equal.ts"
import type { ComponentRegistryState } from "./components.ts"

type Dict = Extract<RawSchema, { type: "object"; additionalProperties: Schema }>
type AnyOfSchema = Extract<RawSchema, { anyOf: readonly Schema[] }>
type AllOfSchema = Extract<RawSchema, { allOf: readonly Schema[] }>
type ArraySchema = Extract<RawSchema, { type: "array"; items: Schema }>
type ObjectSchema = Extract<
  RawSchema,
  { type: "object"; properties: Record<string, Schema> }
>
interface EmittedDiscriminator {
  propertyName: string
  mapping?: Record<string, string>
}

export type EmittedSchema = oas31.SchemaObject | oas31.ReferenceObject

const schemaRef = (name: string): oas31.ReferenceObject => ({
  $ref: `#/components/schemas/${name}`,
})

const schemaRefWithSiblings = (
  name: string,
  siblings: {
    summary?: string
    description?: string
  },
): oas31.ReferenceObject => ({
  ...schemaRef(name),
  ...(siblings.summary !== undefined ? { summary: siblings.summary } : {}),
  ...(siblings.description !== undefined
    ? { description: siblings.description }
    : {}),
})

const rollbackNewSchemas = <T>(
  state: ComponentRegistryState,
  fn: () => T,
): T => {
  const schemaKeysBefore = new Set(Object.keys(state.components.schemas))

  try {
    return fn()
  } finally {
    for (const key of Object.keys(state.components.schemas)) {
      if (!schemaKeysBefore.has(key)) {
        delete state.components.schemas[key]
      }
    }
  }
}

const schemaBaseFields = (
  state: ComponentRegistryState,
  schema: object,
): Record<string, unknown> => {
  const out = Object.fromEntries(Object.entries(schema))
  const boxed = schema as {
    contentSchema?: Schema
    enum?: readonly unknown[]
    examples?: readonly unknown[]
    required?: readonly string[]
    type?: unknown
  }

  if (boxed.contentSchema !== undefined) {
    out["contentSchema"] = emitSchemaRefOrValue(state, boxed.contentSchema)
  }

  if (Array.isArray(boxed.enum)) {
    out["enum"] = [...boxed.enum]
  }

  if (Array.isArray(boxed.examples)) {
    out["examples"] = [...boxed.examples]
  }

  if (Array.isArray(boxed.required)) {
    out["required"] = [...boxed.required]
  }

  if (Array.isArray(boxed.type)) {
    out["type"] = [...boxed.type]
  }

  return out
}

const emitObject = (
  state: ComponentRegistryState,
  schema: Obj,
): oas31.SchemaObject => {
  const out: oas31.SchemaObject = {
    ...schemaBaseFields(state, schema),
    ...(state.objectAdditionalProperties !== undefined
      ? { additionalProperties: state.objectAdditionalProperties }
      : {}),
    properties: Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        emitSchemaRefOrValue(state, value),
      ]),
    ),
  }

  return out
}

const emitDict = (
  state: ComponentRegistryState,
  schema: Dict,
): oas31.SchemaObject => {
  const propertyNames =
    "propertyNames" in schema && schema.propertyNames !== undefined
      ? emitSchemaRefOrValue(state, schema.propertyNames)
      : undefined
  const out: oas31.SchemaObject = {
    ...schemaBaseFields(state, schema),
    additionalProperties: emitSchemaRefOrValue(
      state,
      schema.additionalProperties,
    ),
    ...(propertyNames !== undefined ? { propertyNames } : {}),
  }

  return out
}

const isAnyOfSchema = (schema: RawSchema): schema is AnyOfSchema =>
  "anyOf" in schema

const isAllOfSchema = (schema: RawSchema): schema is AllOfSchema =>
  "allOf" in schema

const isDictSchema = (schema: RawSchema): schema is Dict =>
  "additionalProperties" in schema

const isObjectSchema = (schema: RawSchema): schema is ObjectSchema =>
  "properties" in schema

const isArraySchema = (schema: RawSchema): schema is ArraySchema =>
  "items" in schema

const getStructuralType = (schema: RawSchema): string | undefined => {
  if (!("type" in schema)) {
    return undefined
  }

  if (typeof schema.type === "string") {
    return schema.type
  }

  return schema.type.find(item => item !== "null")
}

const isNullOnlySchema = (schema: RawSchema): boolean =>
  "type" in schema && schema.type === "null"

const nullableLeafNeedsNullExample = (schema: RawSchema): boolean => {
  if (!("type" in schema) || !Array.isArray(schema.type)) {
    return false
  }

  if (!schema.type.includes("null")) {
    return false
  }

  if (
    "example" in schema ||
    ("examples" in schema && Array.isArray(schema.examples))
  ) {
    return false
  }

  return !(
    "properties" in schema ||
    "items" in schema ||
    "allOf" in schema ||
    "oneOf" in schema ||
    "anyOf" in schema
  )
}

const emitNullableLeafExamples = (
  schema: RawSchema,
  out: oas31.SchemaObject,
): oas31.SchemaObject =>
  nullableLeafNeedsNullExample(schema) ? { ...out, examples: [null] } : out

const emitDiscriminator = (
  state: ComponentRegistryState,
  discriminator: Discriminator,
): EmittedDiscriminator => {
  if (discriminator.mapping === undefined) {
    return { propertyName: discriminator.propertyName }
  }

  return {
    propertyName: discriminator.propertyName,
    mapping: Object.fromEntries(
      Object.entries(discriminator.mapping).map(([key, value]) => {
        const emitted = emitSchemaRefOrValue(state, value)

        const ref = "$ref" in emitted ? emitted.$ref : undefined

        if (ref === undefined) {
          throw new Error("Discriminator mapping values must be named schemas")
        }

        return [key, ref]
      }),
    ),
  }
}

const getNullableAllOfInnerSchema = (
  schema: AnyOfSchema,
): AllOfSchema | undefined => {
  if (schema.anyOf.length !== 2) {
    return undefined
  }

  const nonNull = schema.anyOf.find(item => {
    const decoded = decodeNameable(item)

    return !isNullOnlySchema(decoded.value)
  })
  const maybeNull = schema.anyOf.find(item => {
    const decoded = decodeNameable(item)

    return isNullOnlySchema(decoded.value)
  })

  if (nonNull === undefined || maybeNull === undefined) {
    return undefined
  }

  const decoded = decodeNameable(nonNull).value

  return isAllOfSchema(decoded) ? decoded : undefined
}

const emitRawSchemaValue = (
  state: ComponentRegistryState,
  schema: RawSchema,
): oas31.SchemaObject => {
  if ("oneOf" in schema) {
    const out: oas31.SchemaObject = {
      ...schemaBaseFields(state, schema),
      ...(schema.discriminator !== undefined
        ? { discriminator: emitDiscriminator(state, schema.discriminator) }
        : {}),
      oneOf: schema.oneOf.map(item => emitSchemaRefOrValue(state, item)),
    }

    return out
  }

  if (isAnyOfSchema(schema)) {
    const nullableAllOf = getNullableAllOfInnerSchema(schema)

    if (nullableAllOf !== undefined) {
      return {
        ...schemaBaseFields(state, nullableAllOf),
        type: ["object", "null"],
        allOf: nullableAllOf.allOf.map(item =>
          emitSchemaRefOrValue(state, item),
        ),
      }
    }

    const out: oas31.SchemaObject = {
      ...schemaBaseFields(state, schema),
      anyOf: schema.anyOf.map(item => emitSchemaRefOrValue(state, item)),
    }

    return out
  }

  if (isAllOfSchema(schema)) {
    const out: oas31.SchemaObject = {
      ...schemaBaseFields(state, schema),
      allOf: schema.allOf.map(item => emitSchemaRefOrValue(state, item)),
    }

    return out
  }

  const structuralType = getStructuralType(schema)

  if (structuralType === undefined) {
    const out: oas31.SchemaObject = schemaBaseFields(state, schema)

    return emitNullableLeafExamples(schema, out)
  }

  switch (structuralType) {
    case "object":
      if (isDictSchema(schema)) {
        return emitNullableLeafExamples(schema, emitDict(state, schema))
      }

      if (isObjectSchema(schema)) {
        return emitNullableLeafExamples(schema, emitObject(state, schema))
      }

      throw new Error(
        'Schema with type "object" must define properties or additionalProperties',
      )

    case "array":
      if (!isArraySchema(schema)) {
        throw new Error('Schema with type "array" must define items')
      }

      return emitNullableLeafExamples(schema, {
        ...schemaBaseFields(state, schema),
        items: emitSchemaRefOrValue(state, schema.items),
      })

    default: {
      const out: oas31.SchemaObject = schemaBaseFields(state, schema)

      return emitNullableLeafExamples(schema, out)
    }
  }
}

/**
 * Lowers DSL {@link Schema} into inline schema value or schema `$ref`, while
 * registering named schemas in `components.schemas`.
 */
export function emitSchemaRefOrValue(
  state: ComponentRegistryState,
  schema: Schema,
): EmittedSchema {
  const { name, value, summary, description } = decodeNameable(schema)
  const refSiblings = {
    ...(summary !== undefined ? { summary } : {}),
    ...(description !== undefined ? { description } : {}),
  }

  if (name === undefined || name === "") {
    return emitRawSchemaValue(state, value)
  }

  if (state.inProgress.schemas.has(name)) {
    return schemaRefWithSiblings(name, refSiblings)
  }

  const existing = state.components.schemas[name]

  if (existing !== undefined) {
    state.inProgress.schemas.add(name)

    try {
      const candidate = rollbackNewSchemas(state, () =>
        emitRawSchemaValue(state, value),
      )

      if (!deepEqual(existing, candidate)) {
        throw new Error(
          `components.schemas: name "${name}" is already used by a different schema definition`,
        )
      }
    } finally {
      state.inProgress.schemas.delete(name)
    }

    return schemaRefWithSiblings(name, refSiblings)
  }

  state.inProgress.schemas.add(name)

  try {
    state.components.schemas[name] = emitRawSchemaValue(state, value)
  } finally {
    state.inProgress.schemas.delete(name)
  }

  return schemaRefWithSiblings(name, refSiblings)
}
