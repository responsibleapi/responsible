import { formatNames, fullFormats } from "ajv-formats/dist/formats"
import Ajv2020, { type SchemaObject } from "ajv/dist/2020"

/**
 * Validates standalone OpenAPI 3.1 schema objects synchronously.
 *
 * OpenAPI 3.1 aligns Schema Object semantics with JSON Schema draft 2020-12, so
 * this helper uses {@link Ajv2020}. `strict: false` keeps OpenAPI-style
 * extension fields such as `x-*` acceptable during schema validation.
 */
const VALIDATOR = new Ajv2020({ strict: false })

for (const formatName of formatNames) {
  VALIDATOR.addFormat(formatName, fullFormats[formatName])
}

function assertValid<T extends SchemaObject>(
  schema: T,
  valid: boolean,
): asserts schema is T {
  if (!valid) {
    throw new Error(VALIDATOR.errorsText(VALIDATOR.errors))
  }
}

/** Returns schema to be passed to expect() */
export const validateSchema = <T extends SchemaObject>(schema: T): T => {
  const valid = VALIDATOR.validateSchema(schema)

  if (typeof valid !== "boolean") {
    throw new TypeError("validateSchema must stay synchronous")
  }

  assertValid(schema, valid)

  return schema
}

export const validates = (schema: SchemaObject, data: unknown): boolean =>
  VALIDATOR.validate(schema, data)
